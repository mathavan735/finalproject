import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { sendOTP } from '../../utils/emailService';
import toast from 'react-hot-toast';

const SignupForm = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [sentOTP, setSentOTP] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      await sendOTP(email, generatedOTP);
      setSentOTP(generatedOTP);
      setShowOTPInput(true);
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error('Failed to send OTP');
      console.error('OTP error:', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (otp !== sentOTP) {
      toast.error('Invalid OTP');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Account created successfully!');
      onToggleForm();
    } catch (error) {
      toast.error('Failed to create account');
      console.error('Signup error:', error);
    }
  };

  return (
    <form onSubmit={showOTPInput ? handleSignup : handleSendOTP} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="text-white text-sm font-medium block mb-2">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="text-white text-sm font-medium block mb-2">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Create password"
            required
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="text-white text-sm font-medium block mb-2">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm password"
            required
          />
        </div>
        {showOTPInput && (
          <div>
            <label htmlFor="otp" className="text-white text-sm font-medium block mb-2">Enter OTP</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter OTP sent to your email"
              required
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-200 btn-glow"
      >
        {showOTPInput ? 'Create Account' : 'Send OTP'}
      </button>

      <p className="text-center text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleForm}
          className="text-blue-400 hover:text-blue-300"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default SignupForm;