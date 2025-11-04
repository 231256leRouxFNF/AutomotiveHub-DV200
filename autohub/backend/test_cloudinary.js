#!/usr/bin/env node

/**
 * Cloudinary Connection & Upload Test
 * Tests that Cloudinary is properly configured and can upload images
 */

require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Testing Cloudinary Connection & Upload\n');
console.log('='.repeat(60));

// Check configuration
console.log('\n📋 Configuration Check:');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Missing');
console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('\n❌ Cloudinary credentials are missing in .env file!');
  process.exit(1);
}

console.log('\n✅ All credentials present\n');

// Create a test image (1x1 pixel PNG)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const testImagePath = path.join(__dirname, 'test_image.png');

// Test 1: Upload using base64
console.log('🧪 Test 1: Upload test image using base64...');

cloudinary.uploader.upload(`data:image/png;base64,${testImageBase64}`, {
  folder: 'autohub/test',
  public_id: 'test_upload_' + Date.now(),
  resource_type: 'image'
})
.then(result => {
  console.log('✅ Base64 Upload SUCCESS!\n');
  console.log('   📷 Image URL:', result.secure_url);
  console.log('   🆔 Public ID:', result.public_id);
  console.log('   📁 Folder:', result.folder);
  console.log('   📊 Format:', result.format);
  console.log('   📏 Size:', result.bytes, 'bytes');
  
  console.log('\n🧪 Test 2: Upload using file path...');
  
  // Write test image to disk
  fs.writeFileSync(testImagePath, Buffer.from(testImageBase64, 'base64'));
  
  return cloudinary.uploader.upload(testImagePath, {
    folder: 'autohub/test',
    public_id: 'test_file_upload_' + Date.now(),
    resource_type: 'auto'
  });
})
.then(result => {
  console.log('✅ File Upload SUCCESS!\n');
  console.log('   📷 Image URL:', result.secure_url);
  console.log('   🆔 Public ID:', result.public_id);
  console.log('   📁 Folder:', result.folder);
  
  // Clean up test file
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
    console.log('\n🗑️  Test file cleaned up');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 ALL TESTS PASSED!');
  console.log('='.repeat(60));
  console.log('\n✅ Cloudinary is working perfectly!');
  console.log('✅ Images will be stored at: https://res.cloudinary.com/' + process.env.CLOUDINARY_CLOUD_NAME);
  console.log('✅ Your app can upload images both locally and in production\n');
  
  process.exit(0);
})
.catch(error => {
  console.error('\n❌ UPLOAD FAILED!');
  console.error('❌ Error:', error.message);
  
  if (error.http_code) {
    console.error('❌ HTTP Code:', error.http_code);
  }
  
  if (error.error && error.error.message) {
    console.error('❌ Details:', error.error.message);
  }
  
  // Common error messages
  if (error.message.includes('Invalid API Key')) {
    console.error('\n💡 Fix: Check your CLOUDINARY_API_KEY in .env file');
  } else if (error.message.includes('Invalid cloud name')) {
    console.error('\n💡 Fix: Check your CLOUDINARY_CLOUD_NAME in .env file');
  } else if (error.message.includes('Invalid signature')) {
    console.error('\n💡 Fix: Check your CLOUDINARY_API_SECRET in .env file');
  }
  
  // Clean up test file
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
  
  console.error('\n❌ Cloudinary is NOT working properly!\n');
  process.exit(1);
});
