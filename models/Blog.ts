import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Blog document
export interface IBlog extends Document {
  title: string;
  content: string;
  author: string;
  date: Date;
  imageUrl?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Blog schema definition
const blogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [10, 'Content must be at least 10 characters long']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    default: '',
    validate: {
      validator: function(v: string) {
        // Basic URL validation (optional field)
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  category: {
    type: String,
    default: 'General',
    enum: {
      values: ['General', 'Technology', 'Fashion', 'Lifestyle', 'Business', 'Health', 'Sports', 'Entertainment'],
      message: 'Category must be one of: General, Technology, Fashion, Lifestyle, Business, Health, Sports, Entertainment'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function(this: IBlog) {
  return this.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time estimation (assuming 200 words per minute)
blogSchema.virtual('readingTime').get(function(this: IBlog) {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
});

// Virtual for excerpt
blogSchema.virtual('excerpt').get(function(this: IBlog) {
  return this.content.length > 200 
    ? this.content.substring(0, 200) + '...' 
    : this.content;
});

// Index for better performance
blogSchema.index({ title: 'text', content: 'text', author: 'text' });
blogSchema.index({ category: 1, isPublished: 1 });
blogSchema.index({ date: -1 });
blogSchema.index({ tags: 1 });

// Pre-save middleware to clean tags
blogSchema.pre<IBlog>('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    // Remove empty tags and duplicates
    const uniqueTags = new Set(this.tags.filter(tag => tag.trim().length > 0));
    this.tags = Array.from(uniqueTags);
  }
  next();
});

// Static methods
blogSchema.statics.findPublished = function() {
  return this.find({ isPublished: true }).sort({ date: -1 });
};

blogSchema.statics.findByCategory = function(category: string) {
  return this.find({ category, isPublished: true }).sort({ date: -1 });
};

blogSchema.statics.findByAuthor = function(author: string) {
  return this.find({ author, isPublished: true }).sort({ date: -1 });
};

blogSchema.statics.searchBlogs = function(searchTerm: string) {
  return this.find({
    $and: [
      { isPublished: true },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { author: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  }).sort({ date: -1 });
};

// Instance methods
blogSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag.toLowerCase().trim())) {
    this.tags.push(tag.toLowerCase().trim());
  }
  return this.save();
};

blogSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter((t: string) => t !== tag.toLowerCase().trim());
  return this.save();
};

blogSchema.methods.publish = function() {
  this.isPublished = true;
  return this.save();
};

blogSchema.methods.unpublish = function() {
  this.isPublished = false;
  return this.save();
};

// Create and export the model
const Blog = mongoose.model<IBlog>('Blog', blogSchema);

export default Blog;