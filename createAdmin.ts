import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User.ts';

// Load environment variables
dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

interface AdminUser {
  name: string;
  email: string;
  password: string;
  role: 'admin';
}

const createAdmin = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('❌ Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Admin user data
    const adminData: AdminUser = {
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@shopkapee.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
      role: 'admin'
    };

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

    // Create admin user
    const admin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role
    });

    await admin.save();
    console.log('🎉 Admin user created successfully!');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createAdmin();