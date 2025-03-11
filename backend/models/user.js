const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["Administrador", "Cajero"], required: true }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
