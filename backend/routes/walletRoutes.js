const express = require("express");
const router = express.Router();
const {
    obtenerWallets,
    crearWallet,
    eliminarWallet,
    transferirEntreBilleteras,
    recargaAdministrativa
} = require("../controllers/walletController");

const { verificarToken } = require("../controllers/userController");

// Rutas protegidas con token
router.get("/", verificarToken, obtenerWallets);  // Obtener todas las billeteras
router.post("/", verificarToken, crearWallet);   // Crear nueva billetera
router.delete("/:id", verificarToken, eliminarWallet);  // Eliminar billetera, ahora sin walletController. 
router.post("/recarga-administrativa", verificarToken, recargaAdministrativa);  // Recarga administrativa
router.post("/transferencia", verificarToken, transferirEntreBilleteras);  // Transferir entre billeteras

module.exports = router;



