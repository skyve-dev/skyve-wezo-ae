// JWT Test Script
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-this';
console.log('🔐 JWT_SECRET:', JWT_SECRET);

// Test payload
const testPayload = {
  id: 'test-id',
  username: 'test-user',
  email: 'test@example.com',
  role: 'Tenant' as const,
  isAdmin: false
};

console.log('📝 Test payload:', testPayload);

// Generate token
console.log('\n🔧 Generating token...');
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' });
console.log('✅ Token generated:', token);

// Verify token
console.log('\n🔍 Verifying token...');
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully:', decoded);
} catch (error: any) {
  console.log('❌ Token verification failed:', error.message);
}

console.log('\n🧪 Test completed');