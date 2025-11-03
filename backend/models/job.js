const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ["entrada", "salida"], required: true },
  monto: { type: Number, required: true },
  detalle: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  usuario: { type: String, default: "Sistema" }
});

const jobSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  fichas: {
    type: Number,
    default: 0
  },
  movimientos: [movimientoSchema] // 👈 Agregamos el historial de movimientos
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

