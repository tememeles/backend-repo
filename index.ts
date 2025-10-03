/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Application, Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import otpRoutes from './routes/otpRoutes.js';
import bestSellingRoutes from './routes/bestSelling.js';
import { setupSwagger } from './swagger.js';


// Import types
// import { IOrder } from './types/index.js'; // Unused import

// Import models
import Product from "./models/Product.js";
import productsRouter from './routes/products.js';
import uploadRouter from './routes/upload.js';
import Order from "./models/Order.js";
import User from "./models/User.js";
import Blog from "./models/Blog.js";
import Contact from "./models/Contact.js";
import { createContact } from "./Controller/contactController.js";

// Create Express app
const app: Application = express();

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const PORT: number = parseInt(process.env.PORT || '5000', 10);
const MONGO_URI: string = process.env.MONGO_URI || "mongodb+srv://tememeles24_24:83637436@kapeedb-cluster.vdizjvx.mongodb.net/";

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins for now
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err: Error) => console.error("❌ MongoDB connection error:", err));

// Debug: Show loaded environment variables
console.log("🔍 Environment Variables Loaded:");
console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
console.log("👨‍💼 ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
console.log("🔑 EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "***HIDDEN***" : "NOT SET");
console.log("🗄️ MONGO_URI:", process.env.MONGO_URI ? "***CONNECTED***" : "NOT SET");
console.log("-----------------------------------");

// Add test endpoint for debugging
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// User model is imported from models/User.js

// ------------------- Routes ------------------- //
// Products API
app.use('/api/products', productsRouter);
// Image upload API
app.use('/api/upload', uploadRouter);
// otp API
app.use('/api/otp', otpRoutes);
// Best selling products API
app.use('/api/bestselling', bestSellingRoutes);

// Setup Swagger API Documentation
setupSwagger(app);

// Get all products
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err: Error | unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Get product by ID
app.get("/api/products/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// Update product
app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product
app.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Seed products (run once to populate database)
app.post("/api/products/seed", async (req: Request, res: Response) => {
  try {
    const existingProducts = await Product.find();
    if (existingProducts.length > 0) {
      return res.status(400).json({ error: "Products already exist" });
    }
    
    const sampleProducts = [
      {
        productname: "iPhone 16",
        productdescrib: "Latest iPhone with advanced features",
        productprice: 999,
        productquantity: 50,
        category: "Electronics",
        image: "/src/assets/2.jpeg"
      },
      {
        productname: "Apple Watch",
        productdescrib: "Smart watch with health tracking",
        productprice: 399,
        productquantity: 30,
        category: "Electronics",
        image: "/src/assets/3.jpeg"
      },
      {
        productname: "AirPods Pro",
        productdescrib: "Wireless earbuds with noise cancellation",
        productprice: 249,
        productquantity: 75,
        category: "Electronics",
        image: "/src/assets/4.jpeg"
      },
      {
        productname: "MacBook Pro",
        productdescrib: "High-performance laptop for professionals",
        productprice: 1999,
        productquantity: 20,
        category: "Electronics",
        image: "/src/assets/5.jpeg"
      },
      {
        productname: "Samsung Galaxy S24",
        productdescrib: "Android smartphone with excellent camera",
        productprice: 899,
        productquantity: 40,
        category: "Electronics",
        image: "/src/assets/6.jpeg"
      }
    ];
    
    const products = await Product.insertMany(sampleProducts);
    res.status(201).json({ message: "Products seeded successfully", products });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - products
 *               - totalAmount
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID who placed the order
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *                 description: Total order amount
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
// Orders API
// Create order
app.post("/api/orders", async (req: Request, res: Response) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Create multiple orders (batch checkout)
app.post("/api/orders/batch", async (req: Request, res: Response) => {
  try {
    const { orders } = req.body;
    
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: "Orders array is required and cannot be empty" });
    }

    // Validate each order
    for (const orderData of orders) {
      if (!orderData.product || !orderData.quantity || !orderData.price) {
        return res.status(400).json({ error: "Each order must have product, quantity, and price" });
      }
    }

    // Check for recent duplicate orders (within last 30 seconds) to prevent accidental duplicates
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const userId = orders[0].userId;
    
    if (userId) {
      const recentOrders = await Order.find({
        userId: userId,
        createdAt: { $gte: thirtySecondsAgo }
      });

      // Check if we have similar orders recently
      const hasRecentSimilarOrder = recentOrders.some((recentOrder) => 
        orders.some((newOrder: { product: string; quantity: number; price: number }) => 
          newOrder.product === recentOrder.product && 
          newOrder.quantity === recentOrder.quantity &&
          newOrder.price === recentOrder.price
        )
      );

      if (hasRecentSimilarOrder && recentOrders.length >= orders.length) {
        return res.status(409).json({ 
          error: "Similar orders were recently placed. Please wait a few minutes before placing the same order again." 
        });
      }
    }

    // Create all orders
    const createdOrders = await Order.insertMany(orders);
    res.status(201).json({ 
      message: `Successfully created ${createdOrders.length} orders`,
      orders: createdOrders 
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all orders
app.get("/api/orders", async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
app.get("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update order
app.put("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete order
app.delete("/api/orders/:id", async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "securePassword123"
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: User role
 *                 default: user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
// Register
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    
    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.status(201).json({
      message: "User registered successfully",
      user: userData
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
// Login
app.post("/api/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    
    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({ 
      message: "Login successful",
      user: userData
    });
  } catch (err: any) {
    res.status(500).json({ error: "Server error" });
  }
});

// Reset Password
app.post("/api/reset-password", async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword 
    });

    res.status(200).json({ 
      success: true, 
      message: "Password reset successfully" 
    });
  } catch (err: any) {
    console.error('Password reset error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// Get all users
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
app.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
app.put("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Enhanced Blog Routes with TypeScript ------------------- //

// Get all published blogs (using enhanced static method)
app.get("/api/blogs", async (req: Request, res: Response) => {
  try {
    const blogs = await (Blog as any).findPublished();
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get blogs by category
app.get("/api/blogs/category/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const blogs = await (Blog as any).findByCategory(category);
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get blogs by author
app.get("/api/blogs/author/:author", async (req: Request, res: Response) => {
  try {
    const { author } = req.params;
    const blogs = await (Blog as any).findByAuthor(author);
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Search blogs
app.get("/api/blogs/search/:searchTerm", async (req: Request, res: Response) => {
  try {
    const { searchTerm } = req.params;
    const blogs = await (Blog as any).searchBlogs(searchTerm);
    res.json(blogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single blog by ID (with virtual fields)
app.get("/api/blogs/:id", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create new blog
app.post("/api/blogs", async (req: Request, res: Response) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update blog
app.put("/api/blogs/:id", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Publish/Unpublish blog (using instance methods)
app.patch("/api/blogs/:id/publish", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    
    const { action } = req.body; // 'publish' or 'unpublish'
    
    if (action === 'publish') {
      await (blog as any).publish();
    } else if (action === 'unpublish') {
      await (blog as any).unpublish();
    } else {
      return res.status(400).json({ error: "Action must be 'publish' or 'unpublish'" });
    }
    
    res.json({ message: `Blog ${action}ed successfully`, blog });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Add/Remove tag to blog (using instance methods)
app.patch("/api/blogs/:id/tags", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    
    const { tag, action } = req.body; // action: 'add' or 'remove'
    
    if (action === 'add') {
      await (blog as any).addTag(tag);
    } else if (action === 'remove') {
      await (blog as any).removeTag(tag);
    } else {
      return res.status(400).json({ error: "Action must be 'add' or 'remove'" });
    }
    
    res.json({ message: `Tag ${action}ed successfully`, blog });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get all categories
app.get("/api/blogs/meta/categories", async (req: Request, res: Response) => {
  try {
    const categories = await Blog.distinct('category');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all authors
app.get("/api/blogs/meta/authors", async (req: Request, res: Response) => {
  try {
    const authors = await Blog.distinct('author');
    res.json(authors);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tags
app.get("/api/blogs/meta/tags", async (req: Request, res: Response) => {
  try {
    const tags = await Blog.distinct('tags');
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete blog
app.delete("/api/blogs/:id", async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- Contact Routes ------------------- //

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Create a contact message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Contact person's name
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Contact person's email
 *                 example: "jane.doe@example.com"
 *               message:
 *                 type: string
 *                 description: Contact message
 *                 example: "I have a question about your products..."
 *     responses:
 *       201:
 *         description: Contact message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   get:
 *     summary: Get all contact messages (admin only)
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: List of contact messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Create contact message
app.post("/api/contact", createContact);

// Get all contact messages (admin only)
app.get("/api/contact", async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get contact message by ID
app.get("/api/contact/:id", async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact message not found" });
    res.json(contact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete contact message
app.delete("/api/contact/:id", async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact message not found" });
    res.json({ message: "Contact message deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware (add before app.listen)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for frontend communication`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api-docs`);
});