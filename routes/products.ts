import express, { Request, Response } from 'express';
import Product from '../models/Product.ts';

const router = express.Router();

// Interface for product data
interface ProductData {
  productname: string;
  productdescrib: string;
  productprice: number;
  productquantity: number;
  category?: string;
  image?: string;
}

// Interface for MongoDB query
interface ProductQuery {
  category?: string;
  productquantity?: { $gt: number };
  productprice?: { $gte?: number; $lte?: number };
  $or?: Array<{
    productname?: { $regex: string; $options: string };
    productdescrib?: { $regex: string; $options: string };
    category?: { $regex: string; $options: string };
  }>;
}

// GET /api/products - fetch all products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, inStock, minPrice, maxPrice, search, sort } = req.query;
    
    const query: ProductQuery = {};
    
    // Filter by category
    if (category && typeof category === 'string') {
      query.category = category;
    }
    
    // Filter by stock status
    if (inStock === 'true') {
      query.productquantity = { $gt: 0 };
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.productprice = {};
      if (minPrice) query.productprice.$gte = Number(minPrice);
      if (maxPrice) query.productprice.$lte = Number(maxPrice);
    }
    
    // Search functionality
    if (search && typeof search === 'string') {
      query.$or = [
        { productname: { $regex: search, $options: 'i' } },
        { productdescrib: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    let productsQuery = Product.find(query);
    
    // Sorting
    switch (sort) {
      case 'price-asc':
        productsQuery = productsQuery.sort({ productprice: 1 });
        break;
      case 'price-desc':
        productsQuery = productsQuery.sort({ productprice: -1 });
        break;
      case 'name-asc':
        productsQuery = productsQuery.sort({ productname: 1 });
        break;
      case 'name-desc':
        productsQuery = productsQuery.sort({ productname: -1 });
        break;
      case 'newest':
        productsQuery = productsQuery.sort({ createdAt: -1 });
        break;
      case 'oldest':
        productsQuery = productsQuery.sort({ createdAt: 1 });
        break;
      default:
        productsQuery = productsQuery.sort({ createdAt: -1 });
    }
    
    const products = await productsQuery;
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products' 
    });
  }
});

// GET /api/products/categories - get all categories
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Product.distinct('category');
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch categories' 
    });
  }
});

// GET /api/products/search/:term - search products
router.get('/search/:term', async (req: Request<{ term: string }>, res: Response): Promise<void> => {
  try {
    const { term } = req.params;
    const products = await Product.find({
      $or: [
        { productname: { $regex: term, $options: 'i' } },
        { productdescrib: { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to search products' 
    });
  }
});

// POST /api/products - create one or many products
router.post('/', async (req: Request<Record<string, never>, Record<string, never>, ProductData | ProductData[]>, res: Response): Promise<void> => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk insert - validate each product
      for (const product of req.body) {
        if (!product.productname || !product.productdescrib || product.productprice == null || product.productquantity == null) {
          res.status(400).json({ 
            success: false,
            error: 'All products must have name, description, price, and quantity' 
          });
          return;
        }
      }
      
      const products = await Product.insertMany(req.body);
      res.status(201).json({
        success: true,
        message: `${products.length} products created successfully`,
        products
      });
    } else {
      // Single insert - validate required fields
      const { productname, productdescrib, productprice, productquantity } = req.body;
      
      if (!productname || !productdescrib || productprice == null || productquantity == null) {
        res.status(400).json({ 
          success: false,
          error: 'Product name, description, price, and quantity are required' 
        });
        return;
      }
      
      if (productprice < 0) {
        res.status(400).json({ 
          success: false,
          error: 'Product price cannot be negative' 
        });
        return;
      }
      
      if (productquantity < 0 || !Number.isInteger(productquantity)) {
        res.status(400).json({ 
          success: false,
          error: 'Product quantity must be a non-negative integer' 
        });
        return;
      }
      
      const product = new Product(req.body);
      await product.save();
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
      });
    }
  } catch (error) {
    console.error('Error creating product(s):', error);
    res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product(s)' 
    });
  }
});

// PUT /api/products/:id - update a product
router.put('/:id', async (req: Request<{ id: string }, Record<string, never>, Partial<ProductData>>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate productprice and productquantity if provided
    if (req.body.productprice !== undefined && req.body.productprice < 0) {
      res.status(400).json({ 
        success: false,
        error: 'Product price cannot be negative' 
      });
      return;
    }
    
    if (req.body.productquantity !== undefined && 
        (req.body.productquantity < 0 || !Number.isInteger(req.body.productquantity))) {
      res.status(400).json({ 
        success: false,
        error: 'Product quantity must be a non-negative integer' 
      });
      return;
    }
    
    const product = await Product.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product' 
    });
  }
});

// DELETE /api/products/:id - delete a product
router.delete('/:id', async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      product
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete product' 
    });
  }
});

export default router;