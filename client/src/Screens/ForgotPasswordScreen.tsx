import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Mail, Shield, Zap, HelpCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { SheyRoomsLogo } from "./SheyRoomsLogo.tsx";
import API from '../services/api.ts';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await API.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setMessage('Password reset instructions have been sent to your email.');
        setIsEmailSent(true);
      } else {
        setError(response.data.message || 'Failed to send reset email');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setMessage('Reset email sent again! Please check your inbox.');
    } catch (err: any) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {/* Logo and Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <SheyRoomsLogo size="md" />
                </div>
                
                {!isEmailSent ? (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                    <p className="text-gray-600 text-sm">
                      No worries! Enter your email address and we'll send you reset instructions
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                    <p className="text-gray-600 text-sm">
                      We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                  </>
                )}
              </div>

              {/* Success Message */}
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-6">
                  {message}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}

              {!isEmailSent ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input 
                      placeholder="alex@example.com" 
                      type="email" 
                      className="w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full !bg-blue-600 !text-white py-3 rounded-lg font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center text-gray-600 text-sm">
                    <p className="mb-4">
                      Didn't receive the email? Check your spam folder or click below to resend.
                    </p>
                    <Button 
                      onClick={handleResendEmail}
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Resend Email'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Back to Login Button */}
              <div className="mt-6">
                <Button 
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </Button>
              </div>

              {/* Security Note */}
              <div className="flex items-center justify-center space-x-2 mt-6 text-gray-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>Protected with industry-standard encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar - Same as Login */}
      <div className="w-80 bg-white border-l border-gray-200 p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Password Recovery</span>
          </div>
          <div className="space-y-6">
            {/* Email Instructions */}
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Check your email</h3>
                <p className="text-sm text-gray-600 mb-2">
                  We'll send reset instructions to your registered email
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>Instant</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Shield className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Instructions */}
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Reset your password</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Follow the link in your email to create a new password
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Zap className="w-3 h-3" />
                    <span>Quick</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Shield className="w-3 h-3" />
                    <span>Safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
