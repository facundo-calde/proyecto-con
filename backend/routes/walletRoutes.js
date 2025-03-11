const express = require("express");
const router = express.Router();
const {
    obtenerWallets,
    crearWallet,
    eliminarWallet
} = require("../controllers/walletController");

// **Definir las rutas**
router.get("/", obtenerWallets);
router.post("/", crearWallet);
router.delete("/:id", eliminarWallet);

module.exports = router;
