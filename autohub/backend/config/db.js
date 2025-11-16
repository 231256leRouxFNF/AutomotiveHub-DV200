// Dynamically require local or cloud DB config based on DB_ENV
const dbEnv = process.env.DB_ENV || 'cloud';
let db;
if (dbEnv === 'local') {
  db = require('./db.local');
} else {
  db = require('./db.cloud');
}
module.exports = db;
