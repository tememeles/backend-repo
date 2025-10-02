import mongoose, { Document, Schema } from 'mongoose';

export interface IBestSelling extends Document {
  _id: string;
  productId: mongoose.Types.ObjectId;
  productname: string;
  productdescrib: string;
  productprice: number;
  category: string;
  image: string;
  salesCount: number;
  discount?: number;
  label?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bestSellingSchema = new Schema<IBestSelling>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  productname: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  productdescrib: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  productprice: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Accessories', 
      'Analog', 
      'Anklets', 
      'Beauty Accessories', 
      'Belts', 
      'Bracelets', 
      'Casual shoes', 
      'Digital', 
      'Dresses', 
      'Earrings', 
      'Electronics'
    ]
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  salesCount: {
    type: Number,
    default: 0,
    min: [0, 'Sales count cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot be more than 100%']
  },
  label: {
    type: String,
    enum: ['Best Seller', 'Featured', 'New Arrival', 'Limited Edition', 'Trending']
  },
  featured: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
bestSellingSchema.index({ salesCount: -1 });
bestSellingSchema.index({ featured: 1 });
bestSellingSchema.index({ category: 1 });

const BestSelling = mongoose.model<IBestSelling>('BestSelling', bestSellingSchema);

export default BestSelling;