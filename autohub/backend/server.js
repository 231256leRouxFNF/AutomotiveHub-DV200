console.log('🚀 SERVER.JS STARTED - Line 1');

const express = require('express');
const cors = require('cors');
const path = require('path');

// ALWAYS load environment variables first
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log('✓ Dotenv loaded');

// Now import db AFTER environment is loaded
const db = require('./config/db');
console.log('✓ DB loaded');

const app = express();

app.use(cors());
app.use(express.json());

// ONLY THIS ROUTE
app.get('/', (req, res) => {
  res.send('API is working - minimal version');
});

app.get('/test-db', (req, res) => {
  res.json({ ok: 1 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});