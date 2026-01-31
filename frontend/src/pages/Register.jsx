import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending registration request...');
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        setSuccess('OTP sent to your email!');
        setStep(2);
        setResendTimer(60);
        setCanResend(false);
      } else {
        if (response.data.cooldown) {
          setResendTimer(response.data.remainingTime);
          setCanResend(false);
        }
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to send OTP';
      if (err.response?.data?.cooldown) {
        setResendTimer(err.response.data.remainingTime);
        setCanResend(false);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/verify-register', {
        email: formData.email,
        otp: otp
      });

      if (response.data.success) {
        setSuccess('OTP verified! Now set your password.');
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password and Complete Registration
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/set-password', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to create account');
      }
    } catch (err) {
      console.error('Set password error:', err);
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/resend-register-otp', {
        name: formData.name,
        email: formData.email
      });

      if (response.data.success) {
        setSuccess('New OTP sent!');
        setResendTimer(60);
        setCanResend(false);
        setOtp('');
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Go back to step 1
  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  // Go back to step 2
  const handleBackToOTP = () => {
    setStep(2);
    setFormData({ ...formData, password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">
            {step === 1 && 'Enter your details to get started'}
            {step === 2 && 'Enter the OTP sent to your email'}
            {step === 3 && 'Set your password to complete registration'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`w-12 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Verify</span>
            </div>
            <div className={`w-12 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Password</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send OTP
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit OTP to<br />
                  <span className="font-medium text-gray-900">{formData.email}</span>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  required
                  className="input text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn btn-primary py-3 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="text-center">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    📧 Resend OTP
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Resend OTP in <span className="font-semibold text-blue-600">{resendTimer}s</span>
                  </p>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Change Email
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Password Form */}
          {step === 3 && (
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Email verified!<br />
                  <span className="font-medium text-gray-900">{formData.email}</span>
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  className="input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToOTP}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  ← Back to OTP
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          © 2026 Student Learning Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;

