import { Router } from 'express';
import { createOTP, verifyOTP, resendOTP } from '../Controller/otpController.ts';

const router = Router();

// OTP routes that match frontend calls
router.post('/create', createOTP);
router.post('/verify', verifyOTP);
router.post('/resend', resendOTP);

// Legacy routes for backward compatibility
router.post('/generate-otp', createOTP);
router.post('/verify-otp', verifyOTP);

export default router;
