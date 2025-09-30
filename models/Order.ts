import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Order document
export interface IOrder extends Document {
  product: string;
  quantity: number;
  price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  image?: string;
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

// TypeScript interface for Order model with static methods
export interface IOrderModel extends mongoose.Model<IOrder> {
  findByStatus(status: string): Promise<IOrder[]>;
  findByUser(userId: string): Promise<IOrder[]>;
  findRecent(days?: number): Promise<IOrder[]>;
  getTotalRevenue(): Promise<number>;
}

// Order schema definition
const orderSchema = new Schema<IOrder>({
  product: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v: number) {
        return v >= 0;
      },
      message: 'Price must be a positive number'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Status must be a valid order status'
    },
    default: 'pending'
  },
  image: {
    type: String,
    default: '',
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false // Making it optional for backward compatibility
  },
  userName: {
    type: String,
    default: 'Guest',
    trim: true,
    maxlength: [50, 'User name cannot exceed 50 characters']
  },
  userEmail: {
    type: String,
    default: '',
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  }
}, {
  timestamps: true
});

// Virtual for total price
orderSchema.virtual('totalPrice').get(function() {
  return this.quantity * this.price;
});

// Virtual for formatted total price
orderSchema.virtual('formattedTotalPrice').get(function() {
  return `$${(this.quantity * this.price).toFixed(2)}`;
});

// Indexes for better query performance
orderSchema.index({ status: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userEmail: 1 });

// Static methods
orderSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findRecent = function(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.find({ 
    createdAt: { $gte: startDate } 
  }).sort({ createdAt: -1 });
};

orderSchema.statics.getTotalRevenue = async function() {
  const result = await this.aggregate([
    {
      $match: { status: { $in: ['delivered', 'shipped'] } }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } }
      }
    }
  ]);
  return result.length > 0 ? result[0].totalRevenue : 0;
};

// Instance methods
orderSchema.methods.updateStatus = function(status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') {
  this.status = status;
  return this.save();
};

orderSchema.methods.calculateTotal = function() {
  return this.quantity * this.price;
};

const Order = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);

export default Order;