const express = require('express');
const db = require('./config/db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is working');
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1', (err, result) => {
    if (err) return res.status(500).send('DB Error');
    res.send('DB Connected!');
  });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
