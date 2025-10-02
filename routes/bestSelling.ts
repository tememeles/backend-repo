import express from 'express';
import BestSelling from '../models/BestSelling.js';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * @swagger
 * /api/bestselling:
 *   get:
 *     summary: Get all best selling products
 *     tags: [Best Selling]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of products to return
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *     responses:
 *       200:
 *         description: List of best selling products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BestSelling'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Get all best selling products
router.get('/', async (req, res) => {
  try {
    const { limit = 10, category, featured } = req.query;
    
    const query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    const bestSellingProducts = await BestSelling.find(query)
      .sort({ salesCount: -1, createdAt: -1 })
      .limit(Number(limit))
      .populate('productId');

    res.status(200).json(bestSellingProducts);
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    res.status(500).json({ error: 'Failed to fetch best selling products' });
  }
});

/**
 * @swagger
 * /api/bestselling/featured:
 *   get:
 *     summary: Get featured best selling products
 *     tags: [Best Selling]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 8
 *         description: Number of featured products to return
 *     responses:
 *       200:
 *         description: List of featured best selling products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BestSelling'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Get featured best selling products (for home page)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredProducts = await BestSelling.find({ featured: true })
      .sort({ salesCount: -1 })
      .limit(Number(limit));

    res.status(200).json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured best selling products:', error);
    res.status(500).json({ error: 'Failed to fetch featured best selling products' });
  }
});

/**
 * @swagger
 * /api/bestselling:
 *   post:
 *     summary: Add a product to best selling collection
 *     tags: [Best Selling]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - salesCount
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID reference
 *               productname:
 *                 type: string
 *                 description: Product name (optional, for direct creation)
 *               productdescrib:
 *                 type: string
 *                 description: Product description (optional, for direct creation)
 *               productprice:
 *                 type: number
 *                 description: Product price (optional, for direct creation)
 *               category:
 *                 type: string
 *                 description: Product category
 *               salesCount:
 *                 type: integer
 *                 description: Number of sales
 *               featured:
 *                 type: boolean
 *                 description: Whether this is a featured product
 *                 default: false
 *               image:
 *                 type: string
 *                 description: Product image URL
 *     responses:
 *       201:
 *         description: Best selling product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BestSelling'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Add a product to best selling collection
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received POST request to /api/bestselling');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      productId,
      productname,
      productdescrib,
      productprice,
      category,
      image,
      salesCount = 0,
      discount,
      label,
      featured = true
    } = req.body;

    console.log('🔍 Extracted productId:', productId);

    // Validate required fields
    if (!productId) {
      console.log('❌ Missing productId');
      return res.status(400).json({ 
        error: 'ProductId is required',
        received: req.body
      });
    }

    // Check if product already exists in best selling
    console.log('🔍 Checking if product already exists in best selling...');
    const existingBestSelling = await BestSelling.findOne({ productId });
    if (existingBestSelling) {
      console.log('⚠️ Product already exists:', existingBestSelling.productname);
      return res.status(400).json({ 
        error: 'Product already exists in best selling collection',
        details: {
          productName: existingBestSelling.productname,
          currentSalesCount: existingBestSelling.salesCount,
          featured: existingBestSelling.featured,
          suggestion: 'You can update the existing best selling product instead'
        },
        existingProduct: existingBestSelling
      });
    }

    // Verify the product exists
    console.log('🔍 Verifying product exists in products collection...');
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found with ID:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('✅ Product found:', product.productname);

    console.log('✅ Product found:', product.productname);
    console.log('📂 Product category:', product.category);

    // Validate and ensure image URL is from Cloudinary or a valid URL
    let validatedImageUrl = image;
    if (image) {
      // Check if it's a localhost URL and warn about it
      if (image.includes('localhost') || image.includes('127.0.0.1')) {
        console.warn('⚠️ Warning: Localhost image URL detected:', image);
        console.warn('⚠️ This URL will not work in production. Please use Cloudinary upload.');
      }
      
      // If it's a relative path, convert it to a warning
      if (image.startsWith('/src/assets/') || image.startsWith('./') || image.startsWith('../')) {
        console.warn('⚠️ Warning: Relative path detected:', image);
        console.warn('⚠️ Using product default image instead. Please upload to Cloudinary.');
        validatedImageUrl = product.image; // Use product's default image
      }
    } else {
      // Use product's default image if no image provided
      validatedImageUrl = product.image;
    }

    console.log('🖼️ Using image URL:', validatedImageUrl);

    const newBestSelling = new BestSelling({
      productId,
      productname: productname || product.productname,
      productdescrib: productdescrib || product.productdescrib,
      productprice: productprice || product.productprice,
      category: category || product.category,
      image: validatedImageUrl,
      salesCount,
      discount,
      label,
      featured
    });

    console.log('💾 Saving new best selling product...');
    const savedBestSelling = await newBestSelling.save();
    
    // Log successful creation with image source
    console.log(`✅ Best selling product created: ${productname || product.productname}`);
    console.log(`📸 Image source: ${validatedImageUrl?.includes('cloudinary') ? 'Cloudinary' : 'Other'}`);
    
    res.status(201).json(savedBestSelling);
  } catch (error: any) {
    console.error('❌ Error adding product to best selling:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error('📋 Validation Error Details:', error.errors);
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors,
        fullError: error.message
      });
    }
    
    // Handle duplicate key errors (unique constraint violation)
    if (error.code === 11000) {
      console.error('🔑 Duplicate Key Error:', error.keyValue);
      return res.status(400).json({ 
        error: 'Product already exists in best selling collection (duplicate key)',
        duplicateField: error.keyValue
      });
    }
    
    res.status(500).json({ error: 'Failed to add product to best selling collection' });
  }
});

// Update best selling product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate image URL if it's being updated
    if (updateData.image) {
      // Check if it's a localhost URL and warn about it
      if (updateData.image.includes('localhost') || updateData.image.includes('127.0.0.1')) {
        console.warn('⚠️ Warning: Localhost image URL detected in update:', updateData.image);
        console.warn('⚠️ This URL will not work in production. Please use Cloudinary upload.');
      }
      
      // If it's a relative path, reject the update
      if (updateData.image.startsWith('/src/assets/') || updateData.image.startsWith('./') || updateData.image.startsWith('../')) {
        return res.status(400).json({ 
          error: 'Invalid image URL. Please upload image to Cloudinary instead of using relative paths.' 
        });
      }
    }

    const updatedBestSelling = await BestSelling.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBestSelling) {
      return res.status(404).json({ error: 'Best selling product not found' });
    }

    // Log successful update with image source
    if (updateData.image) {
      console.log(`✅ Best selling product updated: ${updatedBestSelling.productname}`);
      console.log(`📸 Image source: ${updateData.image.includes('cloudinary') ? 'Cloudinary' : 'Other'}`);
    }

    res.status(200).json(updatedBestSelling);
  } catch (error) {
    console.error('Error updating best selling product:', error);
    res.status(500).json({ error: 'Failed to update best selling product' });
  }
});

// Update sales count
router.patch('/:id/sales', async (req, res) => {
  try {
    const { id } = req.params;
    const { increment = 1 } = req.body;

    const updatedBestSelling = await BestSelling.findByIdAndUpdate(
      id,
      { $inc: { salesCount: increment } },
      { new: true }
    );

    if (!updatedBestSelling) {
      return res.status(404).json({ error: 'Best selling product not found' });
    }

    res.status(200).json(updatedBestSelling);
  } catch (error) {
    console.error('Error updating sales count:', error);
    res.status(500).json({ error: 'Failed to update sales count' });
  }
});

// Delete from best selling collection
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBestSelling = await BestSelling.findByIdAndDelete(id);

    if (!deletedBestSelling) {
      return res.status(404).json({ error: 'Best selling product not found' });
    }

    res.status(200).json({ message: 'Product removed from best selling collection successfully' });
  } catch (error) {
    console.error('Error removing product from best selling:', error);
    res.status(500).json({ error: 'Failed to remove product from best selling collection' });
  }
});

export default router;