// Simple test to check if backend saves data
const fs = require('fs');

console.log('🔍 Testing file saving...');

// Test creating a simple file
const testData = {
  test: true,
  message: 'Backend is working!',
  timestamp: new Date().toISOString()
};

try {
  fs.writeFileSync('test-save.json', JSON.stringify(testData, null, 2));
  console.log('✅ Test file created successfully!');
  console.log('📁 File contents:', JSON.stringify(testData, null, 2));
  
  // Try to read it back
  const readData = fs.readFileSync('test-save.json', 'utf8');
  const parsed = JSON.parse(readData);
  console.log('✅ File read back successfully:', parsed);
  
} catch (error) {
  console.error('❌ Error saving/reading file:', error);
}

console.log('🚀 If you see this message, Node.js is working!');
console.log('📝 Check if test-save.json file was created in your folder');
