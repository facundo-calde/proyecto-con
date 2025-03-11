const Wallet = require("../models/Wallet");

// **Obtener todas las wallets**
const obtenerWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find();
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las wallets" });
    }
};

// **Crear una nueva wallet con caja**
const crearWallet = async (req, res) => {
    try {
        const { nombre, saldo, caja } = req.body;
        if (!nombre || !caja) {
            return res.status(400).json({ error: "El nombre y la caja son obligatorios" });
        }

        const nuevaWallet = new Wallet({ nombre, saldo, caja });
        await nuevaWallet.save();
        res.status(201).json(nuevaWallet);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar la wallet" });
    }
};

// **Eliminar una wallet**
const eliminarWallet = async (req, res) => {
    try {
        const { id } = req.params;
        await Wallet.findByIdAndDelete(id);
        res.json({ message: "Wallet eliminada" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la wallet" });
    }
};

// **Exportar todas las funciones correctamente**
module.exports = {
    obtenerWallets,
    crearWallet,
    eliminarWallet
};

