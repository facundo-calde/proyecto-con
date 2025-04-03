// Ejemplo en bills.js
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Bill', billSchema);
