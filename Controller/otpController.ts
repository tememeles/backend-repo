import { Request, Response } from 'express';
import { OTPModel } from '../models/OTP.ts';
import { sendEmail } from '../utils/sendEmail.ts';
import User, { IUser } from '../models/User.ts';
import crypto from 'crypto';

// Interface for request body
interface CreateOTPRequest {
  email: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

// Generate secure OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const createOTP = async (req: Request<Record<string, never>, Record<string, never>, CreateOTPRequest>, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
      return;
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
      return;
    }

    // Check if user exists in the database
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      });
      return;
    }

    // Clean up any existing OTPs for this user
    await OTPModel.deleteMany({ userId: user._id!.toString() });

    // Generate OTP
    const otp = generateOTP();

    // Save OTP to database (using user's ID from database)
    await OTPModel.create({
      userId: user._id!.toString(),
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    // Send OTP via email
    try {
      await sendEmail(
        email,
        "Your Kapee Shop Verification Code",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">Kapee Shop</h1>
            <p style="color: #666; margin: 5px 0;">Security Verification</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">Hello, ${user.name || user.email}!</h2>
            <p style="margin: 0 0 20px 0; font-size: 16px; opacity: 0.9;">Your verification code is:</p>
            <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">This code expires in 5 minutes</p>
          </div>

          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">🔒 Security Information:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>This code is valid for 5 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this code, please contact support</li>
              <li>User: ${user.name} (${user.email})</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2025 Kapee Shop. All rights reserved.
            </p>
          </div>
        </div>
        `
      );
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Clean up OTP if email failed
      await OTPModel.deleteOne({ userId: user._id!.toString(), otp });
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again.' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      message: `OTP sent successfully to ${email}`,
      userExists: true,
      userId: user._id!,
      expiresIn: '5 minutes'
    });

  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to generate and send OTP. Please try again.' 
    });
  }
};

export const verifyOTP = async (req: Request<Record<string, never>, Record<string, never>, VerifyOTPRequest>, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    // Find valid OTP
    const otpRecord = await OTPModel.findOne({
      userId: user._id!.toString(),
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
      return;
    }

    // OTP is valid, clean up
    await OTPModel.deleteMany({ userId: user._id!.toString() });

    res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully',
      user: {
        id: user._id!,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to verify OTP. Please try again.' 
    });
  }
};

export const resendOTP = async (req: Request<Record<string, never>, Record<string, never>, CreateOTPRequest>, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
      return;
    }

    // Check if user exists
    const user = await User.findOne({ email }) as IUser | null;
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    // Check if there's a recent OTP (prevent spam)
    const recentOTP = await OTPModel.findOne({
      userId: user._id!.toString(),
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // 1 minute ago
    });

    if (recentOTP) {
      res.status(429).json({ 
        success: false, 
        message: 'Please wait 1 minute before requesting a new OTP' 
      });
      return;
    }

    // Create new OTP (reuse the createOTP logic)
    await createOTP(req, res);

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to resend OTP. Please try again.' 
    });
  }
};