const express = require("express");
const router = express.Router();
const {
    obtenerWallets,
    crearWallet,
    eliminarWallet,
    transferirEntreBilleteras,
    modificarSaldoWallet
} = require("../controllers/walletController");

const verifyToken = require("../middlewares/verifyToken");

// Aplicar el middleware a todo el router
router.use(verifyToken);

router.get("/", obtenerWallets);                   // Obtener todas las billeteras
router.post("/", crearWallet);                    // Crear nueva billetera
router.delete("/:id", eliminarWallet);            // Eliminar billetera
router.post("/transferencia", transferirEntreBilleteras); // Transferir entre billeteras
router.patch("/:id/movimiento", modificarSaldoWallet);


module.exports = router;




