const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    saldo: { type: Number, default: 0 },
    caja: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true }
  });
  

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;

