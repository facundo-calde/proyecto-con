// OfficeExpenses.js
const mongoose = require('mongoose');

const officeExpenseSchema = new mongoose.Schema({
  monto: { type: Number, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('OfficeExpense', officeExpenseSchema);
