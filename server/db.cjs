'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

// Fail fast instead of buffering queries when DB is not connected.
mongoose.set('bufferCommands', false);

let connected = false;

async function connectDB() {
  if (connected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI not set — running without database');
    return;
  }

  try {
    await mongoose.connect(uri);
    connected = true;
    console.log('[MongoDB] Connected');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
