import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for OTP document
export interface IOTP extends Document {
  userId: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

// TypeScript interface for OTP model with static methods
export interface IOTPModel extends mongoose.Model<IOTP> {
  findValidOTP(userId: string, otp: string): Promise<IOTP | null>;
  cleanupExpired(): Promise<number>;
  findByUserId(userId: string): Promise<IOTP[]>;
}

// OTP schema definition
const otpSchema = new Schema<IOTP>({
  userId: { 
    type: String, 
    required: [true, 'User ID is required'],
    trim: true
  },
  otp: { 
    type: String, 
    required: [true, 'OTP is required'],
    trim: true,
    minlength: [4, 'OTP must be at least 4 characters'],
    maxlength: [8, 'OTP cannot exceed 8 characters']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: [true, 'Expiration date is required'],
    validate: {
      validator: function(v: Date) {
        return v > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
});

// Index for automatic cleanup of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ userId: 1 });
otpSchema.index({ createdAt: -1 });

// Virtual for checking if OTP is expired
otpSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for time remaining
otpSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const remaining = this.expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(remaining / 1000)); // seconds
});

// Static methods
otpSchema.statics.findValidOTP = function(userId: string, otp: string) {
  return this.findOne({
    userId,
    otp,
    expiresAt: { $gt: new Date() }
  });
};

otpSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

otpSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Instance methods
otpSchema.methods.verify = function(inputOTP: string): boolean {
  return this.otp === inputOTP && !this.isExpired;
};

otpSchema.methods.extend = function(minutes: number = 10) {
  this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  return this.save();
};

export const OTPModel = mongoose.model<IOTP, IOTPModel>('OTP', otpSchema);
export default OTPModel;