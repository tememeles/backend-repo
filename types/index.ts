// Type definitions for the e-commerce application

import { Document, Model } from 'mongoose';

// Blog interface
export interface IBlog extends Document {
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  formattedDate: string;
  readingTime: string;
  excerpt: string;
  
  // Instance methods
  publish(): Promise<IBlog>;
  unpublish(): Promise<IBlog>;
  addTag(tag: string): Promise<IBlog>;
  removeTag(tag: string): Promise<IBlog>;
}

// Blog model with static methods
export interface IBlogModel extends Model<IBlog> {
  findPublished(): Promise<IBlog[]>;
  findByCategory(category: string): Promise<IBlog[]>;
  findByAuthor(author: string): Promise<IBlog[]>;
  searchBlogs(searchTerm: string): Promise<IBlog[]>;
}

// Product interface
export interface IProduct extends Document {
  productname: string;
  productdescrib: string;
  productprice: number;
  productquantity: number;
  category: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order interface
export interface IOrder extends Document {
  product: string;
  quantity: number;
  price: number;
  userId?: string;
  customerInfo?: {
    name: string;
    email: string;
    address: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Contact interface
export interface IContact extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// OTP interface
export interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}