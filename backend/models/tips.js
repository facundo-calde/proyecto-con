// models/Tip.js

const mongoose = require("mongoose");

const TipSchema = new mongoose.Schema({
  monto: {
    type: Number,
    required: true,
    min: 0
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
  }
});

module.exports = mongoose.model("Tip", TipSchema);
