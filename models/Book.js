const mongoose = require('mongoose');
const { readConn, writeConn } = require('../config/db');

const bookSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    vat: { type: Number, required: true },
    priceAfterVat: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'books' },
);

module.exports = {
  BookRead: readConn.model('Book', bookSchema), // find only
  BookWrite: writeConn.model('Book', bookSchema), // create only
};
