const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  saldo: { type: Number, default: 0 },
  caja: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

  movimientos: [
    {
      tipo: { type: String, enum: ["entrada", "salida"], required: true },
      monto: { type: Number, required: true },
      detalle: { type: String },
      fecha: { type: Date, default: Date.now },
      usuario: { type: String },
      origen: { type: String }, // Origen de la transacción (si aplica)
      destino: { type: String }  // Destino de la transacción (si aplica)
    }
  ]
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;


