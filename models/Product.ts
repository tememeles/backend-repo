import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Product document
export interface IProduct extends Document {
  productname: string;
  productdescrib: string;
  productprice: number;
  productquantity: number;
  category: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// TypeScript interface for Product model with static methods
export interface IProductModel extends mongoose.Model<IProduct> {
  findByCategory(category: string): Promise<IProduct[]>;
  findInStock(): Promise<IProduct[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<IProduct[]>;
  searchProducts(searchTerm: string): Promise<IProduct[]>;
}

// Product schema definition
const productSchema = new Schema<IProduct>({
  productname: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  productdescrib: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Product description cannot exceed 500 characters']
  },
  productprice: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Product price cannot be negative'],
    validate: {
      validator: function(v: number) {
        return v >= 0;
      },
      message: 'Product price must be a positive number'
    }
  },
  productquantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [0, 'Product quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Product quantity must be a whole number'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    default: "Electronics",
    enum: {
      values: ["Electronics", "Clothing", "Books", "Home", "Sports", "Beauty", "Toys", "Other"],
      message: 'Category must be a valid category'
    }
  },
  image: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${this.productprice.toFixed(2)}`;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.productquantity === 0) return 'Out of Stock';
  if (this.productquantity < 10) return 'Low Stock';
  return 'In Stock';
});

// Indexes for better query performance
productSchema.index({ productname: 'text', productdescrib: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ productprice: 1 });
productSchema.index({ productquantity: 1 });

// Static methods
productSchema.statics.findByCategory = function(category: string) {
  return this.find({ category }).sort({ createdAt: -1 });
};

productSchema.statics.findInStock = function() {
  return this.find({ productquantity: { $gt: 0 } }).sort({ createdAt: -1 });
};

productSchema.statics.findByPriceRange = function(minPrice: number, maxPrice: number) {
  return this.find({ 
    productprice: { $gte: minPrice, $lte: maxPrice } 
  }).sort({ productprice: 1 });
};

productSchema.statics.searchProducts = function(searchTerm: string) {
  return this.find({
    $or: [
      { productname: { $regex: searchTerm, $options: 'i' } },
      { productdescrib: { $regex: searchTerm, $options: 'i' } },
      { category: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
};

// Instance methods
productSchema.methods.updateStock = function(quantity: number) {
  this.productquantity = Math.max(0, this.productquantity + quantity);
  return this.save();
};

productSchema.methods.reduceStock = function(quantity: number) {
  if (this.productquantity < quantity) {
    throw new Error('Insufficient stock');
  }
  this.productquantity -= quantity;
  return this.save();
};

const Product = mongoose.model<IProduct, IProductModel>('Product', productSchema);

export default Product;