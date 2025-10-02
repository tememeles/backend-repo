import mongoose from 'mongoose';
import BestSelling from './models/BestSelling.js';
import Product from './models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

const bestSellingData = [
  {
    productname: "Wireless Bluetooth Headphones",
    productdescrib: "Premium quality wireless headphones with noise cancellation and 30-hour battery life.",
    productprice: 129.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    salesCount: 2500,
    discount: 25,
    label: "Best Seller",
    featured: true
  },
  {
    productname: "Smart Fitness Watch",
    productdescrib: "Advanced fitness tracking with heart rate monitor, GPS, and sleep tracking.",
    productprice: 199.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    salesCount: 1800,
    discount: 15,
    label: "Trending",
    featured: true
  },
  {
    productname: "Premium Leather Wallet",
    productdescrib: "Handcrafted genuine leather wallet with RFID blocking technology.",
    productprice: 49.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1627123423411-6017893873d0?w=500",
    salesCount: 1500,
    discount: 20,
    label: "Featured",
    featured: true
  },
  {
    productname: "Designer Sunglasses",
    productdescrib: "UV protection designer sunglasses with polarized lenses.",
    productprice: 89.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    salesCount: 1200,
    discount: 30,
    label: "Limited Edition",
    featured: true
  },
  {
    productname: "Wireless Phone Charger",
    productdescrib: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    productprice: 29.99,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500",
    salesCount: 3200,
    discount: 10,
    label: "Best Seller",
    featured: true
  },
  {
    productname: "Casual Sneakers",
    productdescrib: "Comfortable everyday sneakers with memory foam insole.",
    productprice: 79.99,
    category: "Casual shoes",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
    salesCount: 980,
    discount: 35,
    label: "New Arrival",
    featured: true
  },
  {
    productname: "Gold Chain Necklace",
    productdescrib: "18k gold plated chain necklace with elegant design.",
    productprice: 149.99,
    category: "Bracelets",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500",
    salesCount: 750,
    discount: 15,
    label: "Featured",
    featured: true
  },
  {
    productname: "Cotton Summer Dress",
    productdescrib: "Lightweight cotton dress perfect for summer occasions.",
    productprice: 59.99,
    category: "Dresses",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500",
    salesCount: 1100,
    discount: 25,
    label: "Trending",
    featured: true
  }
];

async function seedBestSellingProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing best selling products
    console.log('🗑️ Clearing existing best selling products...');
    await BestSelling.deleteMany({});
    console.log('✅ Cleared existing best selling products');

    // Get existing products to link with
    const existingProducts = await Product.find({});
    console.log(`📦 Found ${existingProducts.length} existing products`);

    // Create best selling products
    console.log('🌱 Creating best selling products...');
    
    for (let i = 0; i < bestSellingData.length && i < existingProducts.length; i++) {
      const productData = bestSellingData[i];
      const existingProduct = existingProducts[i];
      
      // Create best selling product with reference to existing product
      const bestSellingProduct = new BestSelling({
        productId: existingProduct._id,
        ...productData
      });
      
      await bestSellingProduct.save();
      console.log(`✅ Created best selling product: ${productData.productname}`);
    }

    // If we have more best selling data than existing products, create them without productId reference
    if (bestSellingData.length > existingProducts.length) {
      for (let i = existingProducts.length; i < bestSellingData.length; i++) {
        const productData = bestSellingData[i];
        
        // Create a new product first
        const newProduct = new Product({
          productname: productData.productname,
          productdescrib: productData.productdescrib,
          productprice: productData.productprice,
          productquantity: Math.floor(Math.random() * 100) + 10, // Random quantity
          category: productData.category,
          image: productData.image
        });
        
        const savedProduct = await newProduct.save();
        
        // Now create best selling product with reference
        const bestSellingProduct = new BestSelling({
          productId: savedProduct._id,
          ...productData
        });
        
        await bestSellingProduct.save();
        console.log(`✅ Created new product and best selling entry: ${productData.productname}`);
      }
    }

    const totalBestSelling = await BestSelling.countDocuments();
    console.log(`🎉 Successfully seeded ${totalBestSelling} best selling products!`);

  } catch (error) {
    console.error('❌ Error seeding best selling products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedBestSellingProducts();