// debug-bookings-token.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Copy the actual token from your browser's network tab when bookings API fails
const failingToken = 'PASTE_ACTUAL_FAILING_TOKEN_HERE';
const secret = process.env.JWT_SECRET;

console.log('🔍 Debugging failing bookings token:');
console.log('- Token length:', failingToken.length);
console.log('- Secret length:', secret.length);

try {
  const decoded = jwt.verify(failingToken, secret, { algorithms: ['HS256'] });
  console.log('✅ Token is actually valid:', decoded);
} catch (error) {
  console.error('❌ Token verification failed:', error.message);
  
  // Try with old secret
  try {
    const decodedOld = jwt.verify(failingToken, 'secret123', { algorithms: ['HS256'] });
    console.log('🔍 Token was signed with old secret:', decodedOld);
  } catch (e) {
    console.log('❌ Not signed with old secret either');
  }
}
