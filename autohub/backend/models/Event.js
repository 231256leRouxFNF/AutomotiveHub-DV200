// autohub/backend/models/Event.js

const db = require('../config/db');

const Event = {};

// Create a new event
Event.create = (eventData, callback) => {
  const { userId, title, description, date, time, location, imageUrl } = eventData;
  const sql = `
    INSERT INTO events (userId, title, description, date, time, location, imageUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [userId, title, description, date, time, location, imageUrl];
  db.query(sql, values, callback);
};

// Find an event by ID
Event.findById = (id, callback) => {
  const sql = 'SELECT * FROM events WHERE id = ?';
  db.query(sql, [id], callback);
};

// Get all events
Event.findAll = (callback) => {
  const sql = 'SELECT * FROM events ORDER BY date ASC, time ASC';
  db.query(sql, callback);
};

// Find events by userId
Event.findByUserId = (userId, callback) => {
  const sql = 'SELECT * FROM events WHERE userId = ? ORDER BY date ASC, time ASC';
  db.query(sql, [userId], callback);
};

// Update an event
Event.update = (id, eventData, callback) => {
  const { title, description, date, time, location, imageUrl } = eventData;
  const sql = `
    UPDATE events
    SET title = ?, description = ?, date = ?, time = ?, location = ?, imageUrl = ?
    WHERE id = ?
  `;
  const values = [title, description, date, time, location, imageUrl, id];
  db.query(sql, values, callback);
};

// Delete an event
Event.delete = (id, callback) => {
  const sql = 'DELETE FROM events WHERE id = ?';
  db.query(sql, [id], callback);
};

module.exports = Event;
