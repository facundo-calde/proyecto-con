// OfficeExpenses.js
const mongoose = require('mongoose');

const officeExpenseSchema = new mongoose.Schema({
  monto: { type: Number, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true } // agregado para vincular el puesto
});

module.exports = mongoose.model('OfficeExpense', officeExpenseSchema);