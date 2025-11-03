const mongoose = require("mongoose");

const MovimientoSchema = new mongoose.Schema({
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
        ref: "User",  // Referencia al modelo User
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet",  // Referencia al modelo Wallet
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",  // Referencia al modelo Job
        required: true
    }
});

module.exports = mongoose.model("Movimiento", MovimientoSchema);  // Asegúrate de que el nombre sea "Movimiento"
