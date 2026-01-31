import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import sendOTPEmail from '../services/emailService.js';

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ 
        success: true, 
        message: 'If an account exists, an OTP will be sent',
        emailExists: false
      });
    }

    // Check for existing OTP and resend cooldown
    const existingOTP = await OTP.findOne({ email, type: 'forgot-password' });
    
    if (existingOTP) {
      // Check if 60 seconds have passed since last OTP
      const timeSinceLastOTP = Date.now() - existingOTP.createdAt;
      const cooldownPeriod = 60000; // 60 seconds

      if (timeSinceLastOTP < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastOTP) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingTime} seconds before requesting a new OTP`,
          cooldown: true,
          remainingTime: remainingTime
        });
      }

      // Delete existing OTP
      await OTP.deleteOne({ _id: existingOTP._id });
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Save OTP to database (expires in 5 minutes)
    await OTP.create({
      email,
      otp: hashedOTP,
      type: 'forgot-password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      emailExists: true,
      email: email
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    // Hash the provided OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp: hashedOTP,
      type: 'forgot-password',
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      email: email,
      verified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete any existing OTP
    await OTP.deleteMany({ email, type: 'forgot-password' });

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Save OTP to database
    await OTP.create({
      email,
      otp: hashedOTP,
      type: 'forgot-password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Send new OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to resend OTP. Please try again.' 
      });
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password with OTP verification
// @route   POST /api/auth/reset-password-otp
// @access  Public
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, OTP and new password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Hash the provided OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp: hashedOTP,
      type: 'forgot-password',
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

