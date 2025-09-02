import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Mail, Shield, Star, Heart, TrendingUp, Zap, HelpCircle } from "lucide-react";
import { SheyRoomsLogo } from "./SheyRoomsLogo.tsx";

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegister?: () => void;
}

export default function Registerscreen({ onSwitchToLogin, onRegister }: RegisterProps) {
  // ✅ Add state management
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Validate passwords match
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    setError('Please fill in all fields');
    setLoading(false);
    return;
  }

  try {
    console.log('🔍 Attempting registration...');
    
    // Send name as string to match your backend expectations
    const userData = {
      name: `${firstName} ${lastName}`, // Backend expects string, not object
      email: email.trim().toLowerCase(),
      password: password
    };
    
    console.log('Registration data:', userData);
    
    const response = await axios.post('https://sheyrooms-backend.vercel.app/api/users/register', userData);
    
    console.log('Registration response:', response.data);
    
    // Check for successful response
    if (response.status === 200 || response.status === 201 || 
        response.data?.success === true || 
        response.data?.message?.includes('success') ||
        response.data?.user) {
      
      console.log('✅ Registration successful');
      
      // ✅ REMOVED: onRegister() call that was causing the error
      // onRegister(); 
      
      // Navigate to login after short delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } else {
      console.log('Registration completed but unexpected response format');
      setError('Registration completed. Please try logging in.');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  } catch (err: any) {
    console.error('❌ Registration error:', err);
    
    if (err.response) {
      console.log('Error response status:', err.response.status);
      console.log('Error response data:', err.response.data);
      
      if (err.response.status === 400 && err.response.data?.message?.includes('already exists')) {
        setError('User already exists. Please try logging in.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } else {
        const errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        setError(errorMessage);
      }
    } else if (err.request) {
      setError('Unable to connect to server. Please check your connection.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
                <p className="text-gray-600 text-sm">Join SheyRooms to book unique stays and manage trips</p>
              </div>

              {/* Features */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="w-4 h-4" />
                  <span>Personalized picks</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure & private</span>
                </div>
              </div>

              {/* Social Login Options */}
              <div className="space-y-3 mb-6">
                <Button variant="outline" className="w-full flex items-center justify-center space-x-2 p-3">
                  <Mail className="w-4 h-4" />
                  <span>Continue with Email</span>
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex items-center justify-center space-x-2 p-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center space-x-2 p-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.163-1.495-.695-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                    <span>Apple</span>
                  </Button>
                </div>
              </div>

              <div className="text-center text-gray-400 text-sm mb-6">or</div>

              {/* ✅ Updated Registration Form with backend integration */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ✅ Add error display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First name</label>
                    <Input 
                      placeholder="Alex" 
                      className="w-full"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last name</label>
                    <Input 
                      placeholder="Morgan" 
                      className="w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input 
                    placeholder="alex@example.com" 
                    type="email" 
                    className="w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <Input 
                    placeholder="Create a strong password" 
                    type="password" 
                    className="w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                  <Input 
                    placeholder="Re-enter your password" 
                    type="password" 
                    className="w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="text-right">
                  <a href="#" className="text-blue-600 text-sm hover:underline">View terms</a>
                </div>

                {/* ✅ Updated button with loading state */}
                <Button 
                  type="submit"
                  className="w-full !bg-blue-600 !text-white py-3 rounded-lg font-medium" 
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              {/* Security Note */}
              <div className="flex items-center justify-center space-x-2 mt-6 text-gray-500 text-sm">
                <Shield className="w-4 h-4" />
                <span>Protected with industry-standard encryption</span>
              </div>

              {/* Sign In Link */}
              <div className="text-center mt-6 text-sm">
                <span className="text-gray-600">Already have an account? </span>
<button 
  onClick={() => navigate('/login')}
  className="text-blue-600 hover:underline font-medium"
  type="button"
>
  Sign in
</button>
                

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Sidebar - unchanged */}
      <div className="w-80 bg-white border-l border-gray-200 p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="font-semibold text-gray-900">Why join SheyRooms</span>
          </div>
          <div className="space-y-6">
            {/* Member Pricing */}
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Member pricing</h3>
                <p className="text-sm text-gray-600 mb-2">Save up to 15% on select stays</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-blue-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>Deals</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Zap className="w-3 h-3" />
                    <span>Early access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curated Stays */}
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Curated stays</h3>
                <p className="text-sm text-gray-600 mb-2">Handpicked places you'll love</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Heart className="w-3 h-3" />
                    <span>Wishlist</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Star className="w-3 h-3" />
                    <span>Top rated</span>
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
