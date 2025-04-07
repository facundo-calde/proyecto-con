const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");




// **Rutas de Usuarios**
router.get("/", userController.verificarToken, userController.obtenerUsuarios);
router.post("/", userController.crearUsuario);
router.post("/login", userController.loginUsuario);
router.patch('/:id/password', userController.verificarToken, userController.cambiarPassword);
router.patch("/:id", userController.verificarToken, userController.cambiarEstadoUsuario);



module.exports = router;
