#!/usr/bin/env node

/**
 * Test Frontend Cloudinary Account (dipwvhvz0)
 * Tests if the hardcoded account in VehicleManagement.js works
 */

const https = require('https');

const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
const payload = [
  `--${boundary}`,
  'Content-Disposition: form-data; name="file"',
  '',
  'data:image/png;base64,' + testImageBase64,
  `--${boundary}`,
  'Content-Disposition: form-data; name="upload_preset"',
  '',
  'autohub',
  `--${boundary}--`,
  ''
].join('\r\n');

const options = {
  hostname: 'api.cloudinary.com',
  path: '/v1_1/dipwvhvz0/image/upload',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log('\n🧪 Testing Frontend Cloudinary Account (dipwvhvz0)...\n');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! Frontend account (dipwvhvz0) WORKS!');
        console.log('\n📷 Image uploaded successfully:');
        console.log('   URL:', response.secure_url);
        console.log('   Public ID:', response.public_id);
        console.log('   Format:', response.format);
        console.log('\n✅ RECOMMENDATION: Use dipwvhvz0 for all uploads\n');
      } else {
        console.log('❌ FAILED! Frontend account also has issues');
        console.log('Status:', res.statusCode);
        console.log('Error:', response.error?.message || JSON.stringify(response));
        console.log('\n⚠️  You may need to create a new Cloudinary account\n');
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(payload);
req.end();
