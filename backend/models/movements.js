const mongoose = require("mongoose");

const MovementSchema = new mongoose.Schema({
  monto: {
    type: Number,
    required: true
  },
  descripcion: {
    type: String,
    default: ""
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true
  }
});

module.exports = mongoose.model("Movement", MovementSchema);
