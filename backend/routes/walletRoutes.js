const express = require("express");
const router = express.Router();
const {
    obtenerWallets,
    crearWallet,
    eliminarWallet
} = require("../controllers/walletController");

const { verificarToken } = require("../controllers/userController"); // 👈 importar middleware

// ✅ APLICAR EL MIDDLEWARE DE AUTENTICACIÓN
router.get("/", verificarToken, obtenerWallets);
router.post("/", verificarToken, crearWallet);
router.delete("/:id", verificarToken, eliminarWallet);

module.exports = router;

