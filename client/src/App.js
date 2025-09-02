// App.jsx or App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

import Homescreen from './Screens/Homescreen.tsx';
import Bookingscreen from './Screens/Bookingscreen.jsx';
import Profilescreen from './Screens/Profilescreen.tsx';
import Adminscreen from './Screens/Adminscreen.tsx';
import Landingscreen from './Screens/Landingscreen.tsx';
import Loginscreen from './Screens/Loginscreen.tsx';
import Registerscreen from './Screens/Registerscreen.tsx';
import Explorescreen from './Screens/Explorescreen.tsx';
import MyTrips  from './Screens/MyTrips.tsx';
import BookingDetails from './Screens/BookingDetails.tsx';
import Wishlistscreen from './Screens/Wishlist.tsx';
import Experiencescreen from './Screens/Experiencescreen.tsx';
import AboutPage from './Screens/AboutPage.tsx';
import ContactPage from './Screens/ContactPage.tsx';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen.tsx';

import Loader from './Components/Loader.js';

// ✅ Define ProtectedRoute Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />; // Use your existing loader component
  }

  return user ? children : <Navigate to="/login" replace />;
}

// ✅ Define AdminRoute Component (for admin-only pages)
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/home" replace />; // Redirect non-admins to home
  }

  return children;
}

// ✅ App Content Component (inside AuthProvider)
function AppContent() {
  return (
    <PayPalScriptProvider
      options={{
        'client-id': 'AZwCSNQNKFdYp5y0jcgwSGgy8ZuuX0reXn_ZHwvL5ceQCp9zHlYa7o42vJ1m42ZnzAkemKfQ3fu7HGil',
        currency: 'USD',
      }}
    >
      <div className="App">
        <Router>
          {/* Navbar is inside Router */}

          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landingscreen />} />
              <Route path="/register" element={<Registerscreen />} />
              <Route path="/login" element={<Loginscreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

              {/* Protected Routes */}
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute>
                    <Homescreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/explore" 
                element={
                  <ProtectedRoute>
                    <Explorescreen />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/mytrips" 
                element={
                  <ProtectedRoute>
                    <MyTrips />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/booking/:bookingId" 
                element={
                  <ProtectedRoute>
                    <BookingDetails />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/wishlist" 
                element={
                  <ProtectedRoute>
                    <Wishlistscreen />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/book/:roomid/:fromdate/:todate" 
                element={
                  <ProtectedRoute>
                    <Bookingscreen />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profilescreen />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/experiences" 
                element={
                  <ProtectedRoute>
                    <Experiencescreen />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/about" 
                element={
                  <ProtectedRoute>
                    <AboutPage />
                  </ProtectedRoute>
                }
              />

              <Route 
                path="/contact"
                element={
                  <ProtectedRoute>
                    <ContactPage />
                  </ProtectedRoute>
                }
              />        


              {/* Admin Only Routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Adminscreen />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#363636', color: '#fff' },
              success: { duration: 3000, style: { background: '#10B981', color: '#fff' } },
              error: { duration: 5000, style: { background: '#EF4444', color: '#fff' } },
            }}
          />
        </Router>
      </div>
    </PayPalScriptProvider>
  );
}

// ✅ Main App Component wrapped with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

