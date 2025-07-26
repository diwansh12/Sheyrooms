// App.js - CORRECTED VERSION
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Your existing screens
import Homescreen from './Screens/Homescreen';
import Bookingscreen from './Screens/Bookingscreen';
import Profilescreen from './Screens/Profilescreen';
import Adminscreen from './Screens/Adminscreen';
import Landingscreen from './Screens/Landingscreen';
import Loginscreen from './Screens/Loginscreen';
import Registerscreen from './Screens/Registerscreen';
import FavoritesScreen from './Screens/FavoritesScreen';

// Your existing components
import Navbar from './Components/Navbar';  // Your navbar component
import Loader from './Components/Loader';

function App() {
  return (
    <PayPalScriptProvider options={{ 
      "client-id": "AZeCFelxYsWdBQGD23iW5E_dmPdi5svLf0SJC8OMjBRkMl0yyzfX4lwtfIO8IvzcVck7s6cTyI9Hntf9",
      currency: "USD"
    }}>
      <div className="App">
        <Router>
          {/* ✅ CORRECT - Navbar is now inside Router */}
          <Navbar />
          
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Landingscreen />} />
              <Route path="/home" element={<Homescreen />} />
              <Route 
                path="/book/:roomid/:fromdate/:todate" 
                element={<Bookingscreen />} 
              />
              <Route path="/register" element={<Registerscreen />} />
              <Route path="/login" element={<Loginscreen />} />  
              <Route path="/profile" element={<Profilescreen />} />
              <Route path="/admin" element={<Adminscreen />} />
              <Route path="/favorites" element={<FavoritesScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                  color: '#fff',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                  color: '#fff',
                },
              },
            }}
          />
        </Router>
      </div>
    </PayPalScriptProvider>
  );
}

export default App;

