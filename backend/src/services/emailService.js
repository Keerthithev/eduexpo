import nodemailer from 'nodemailer';

const sendOTPEmail = async (email, otp, type = 'forgot-password') => {
  try {
    // For Gmail, if password contains spaces, it might be an app password
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Create transporter with more robust configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const isForgotPassword = type === 'forgot-password';
    const subject = isForgotPassword 
      ? '🔐 Password Reset OTP - Student Learning Tracker'
      : '📧 Email Verification OTP - Student Learning Tracker';

    const title = isForgotPassword ? 'Password Reset Request' : 'Email Verification';
    const description = isForgotPassword
      ? 'We received a request to reset your password. Please use the OTP code below to proceed:'
      : 'Thank you for registering! Please use the OTP code below to verify your email address:';

    const mailOptions = {
      from: `"Student Learning Tracker" <${emailUser}>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 30px; }
            .greeting { font-size: 18px; margin-bottom: 20px; color: #333; }
            .description { color: #666; margin-bottom: 25px; }
            .otp-container { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; border: 2px dashed #667eea; }
            .otp-label { font-size: 13px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
            .otp-code { font-size: 42px; font-weight: bold; color: #667eea; letter-spacing: 12px; font-family: 'Courier New', monospace; margin: 10px 0; }
            .expiry { font-size: 12px; color: #999; margin-top: 10px; }
            .info-box { background: #fff8e6; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-box-title { font-weight: bold; color: #856404; margin-bottom: 5px; }
            .info-box ul { margin: 5px 0 0 0; padding-left: 20px; color: #856404; font-size: 14px; }
            .info-box li { margin: 5px 0; }
            .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee; }
            .footer p { margin: 5px 0; color: #999; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Student Learning Tracker</h1>
              <p>Your Learning Journey Starts Here</p>
            </div>
            <div class="content">
              <div class="greeting">Hello,</div>
              <div class="description">${description}</div>
              
              <div class="otp-container">
                <div class="otp-label">Your OTP Code</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">⏰ This OTP is valid for 5 minutes</div>
              </div>
              
              <div class="info-box">
                <div class="info-box-title">⚠️ Security Notice</div>
                <ul>
                  <li>Never share this OTP with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>For your security, this OTP will expire in 5 minutes</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Student Learning Tracker. All rights reserved.</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Error message:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your EMAIL_USER and EMAIL_PASS in .env file');
      console.error('For Gmail, make sure to use an App Password, not your regular password');
    }
    return false;
  }
};

export default sendOTPEmail;

