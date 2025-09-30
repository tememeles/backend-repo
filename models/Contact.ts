import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Contact document
export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// TypeScript interface for Contact model with static methods
export interface IContactModel extends mongoose.Model<IContact> {
  findRecent(days?: number): Promise<IContact[]>;
  findByEmail(email: string): Promise<IContact[]>;
  searchMessages(searchTerm: string): Promise<IContact[]>;
}

// Contact schema definition
const contactSchema = new Schema<IContact>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  message: { 
    type: String, 
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ name: 'text', message: 'text' });

// Static methods
contactSchema.statics.findRecent = function(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return this.find({ 
    createdAt: { $gte: startDate } 
  }).sort({ createdAt: -1 });
};

contactSchema.statics.findByEmail = function(email: string) {
  return this.find({ email }).sort({ createdAt: -1 });
};

contactSchema.statics.searchMessages = function(searchTerm: string) {
  return this.find({
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { message: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
};

// Virtual for formatted date
contactSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const Contact = mongoose.model<IContact, IContactModel>('Contact', contactSchema);

export default Contact;