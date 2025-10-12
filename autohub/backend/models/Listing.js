// autohub/backend/models/Listing.js

const db = require('../config/db');

const Listing = {};

// Example: Create a new listing
Listing.create = (listingData, callback) => {
  const { userId, title, description, price, category, condition, year, make, model, mileage, location, imageUrls } = listingData;
  const sql = `
    INSERT INTO listings (userId, title, description, price, category, condition, year, make, model, mileage, location, imageUrls)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [userId, title, description, price, category, condition, year, make, model, mileage, location, JSON.stringify(imageUrls)];
  db.query(sql, values, callback);
};

// Example: Find a listing by ID
Listing.findById = (id, callback) => {
  const sql = 'SELECT * FROM listings WHERE id = ?';
  db.query(sql, [id], callback);
};

// Example: Get all listings
Listing.findAll = (callback) => {
  const sql = 'SELECT * FROM listings';
  db.query(sql, callback);
};

// Find listings by userId
Listing.findByUserId = (userId, callback) => {
  const sql = 'SELECT * FROM listings WHERE userId = ?';
  db.query(sql, [userId], callback);
};

// Example: Update a listing
Listing.update = (id, listingData, callback) => {
  const { title, description, price, category, condition, year, make, model, mileage, location, imageUrls } = listingData;
  const sql = `
    UPDATE listings
    SET title = ?, description = ?, price = ?, category = ?, condition = ?, year = ?, make = ?, model = ?, mileage = ?, location = ?, imageUrls = ?
    WHERE id = ?
  `;
  const values = [title, description, price, category, condition, year, make, model, mileage, location, JSON.stringify(imageUrls), id];
  db.query(sql, values, callback);
};

// Example: Delete a listing
Listing.delete = (id, callback) => {
  const sql = 'DELETE FROM listings WHERE id = ?';
  db.query(sql, [id], callback);
};

// Generic query method for more complex queries
Listing.query = (sql, values, callback) => {
  db.query(sql, values, callback);
};

module.exports = Listing;
