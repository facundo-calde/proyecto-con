const express = require("express");
const router = express.Router();
const { obtenerUsuarios, crearUsuario, loginUsuario, verificarToken } = require("../controllers/userController");

// **Rutas de Usuarios**
router.get("/", verificarToken, obtenerUsuarios); // Protegida con JWT
router.post("/", crearUsuario);
router.post("/login", loginUsuario);

module.exports = router;
