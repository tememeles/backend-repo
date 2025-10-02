import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';

interface ProductData {
  productname: string;
  productdescrib: string;
  productprice: number;
  productquantity: number;
  category: string;
  image: string;
}

const products: ProductData[] = [
  // --- Electronics Products ---
  {
    productname: "Samsung Galaxy S24",
    productdescrib: "The latest Samsung Galaxy S24 with advanced features and sleek design.",
    productprice: 799,
    productquantity: 10,
    category: "Digital Smart",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758653767/bsevdqo4xg9arqslsqzp.jpg"
  },
  {
    productname: "Apple iPhone 15 Pro",
    productdescrib: "Apple's newest iPhone 15 Pro with improved camera and performance.",
    productprice: 999,
    productquantity: 15,
    category: "Digital Smart",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758662158/pu1mpo18sn3yt2pzuqh5.jpg"
  },
  {
    productname: "Apple Watch Series 9",
    productdescrib: "Track your health and fitness with the Apple Watch Series 9.",
    productprice: 499,
    productquantity: 20,
    category: "Electronics",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758662567/nb0lbnargsm9p6otkivi.jpg"
  },
  {
    productname: "JBL On-Ear Headphones",
    productdescrib: "Enjoy powerful sound and deep bass with JBL On-Ear Headphones.",
    productprice: 124,
    productquantity: 25,
    category: "Electronics",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758662660/e7oapicmwntrpastfoqv.jpg"
  },
  {
    productname: "Microsoft Xbox One Wireless Controller",
    productdescrib: "Experience precise control and comfort with the Xbox One Wireless Controller.",
    productprice: 45,
    productquantity: 30,
    category: "Electronics",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758662835/h5ulmfcao8axcvc380hd.jpg"
  },
  {
    productname: "Samsung Gear 360 Camera",
    productdescrib: "Capture every angle with the Samsung Gear 360 Camera.",
    productprice: 48,
    productquantity: 12,
    category: "Electronics",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758662914/fwbe3fftdqkncupkjvgl.jpg"
  },
  {
    productname: "Beats Studio3 Wireless Headphones",
    productdescrib: "Premium sound and noise cancellation for all-day listening.",
    productprice: 99,
    productquantity: 22,
    category: "Electronics",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758662996/vbo1vr3kza0lphqmaxaa.jpg"
  },
  {
    productname: "Apple Watch Series 5 Black Milanese Loop",
    productdescrib: "Upgrade your style with the Apple Watch Series 5 Black Milanese Loop.",
    productprice: 599,
    productquantity: 8,
    category: "Electronics",
    image: "https://res.cloudinary.com/dpjeeyxti/image/upload/v1758663057/rhnnxbyuijv12fio5fj0.jpg"
  }
];

const seedProducts = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`🎉 Successfully seeded ${insertedProducts.length} products`);

    // Display seeded products
    console.log('\n📦 Seeded Products:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productname} - $${product.productprice} (${product.productquantity} in stock)`);
    });

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
seedProducts();