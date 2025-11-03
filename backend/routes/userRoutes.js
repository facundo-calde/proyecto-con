const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");

// Rutas públicas (sin token)
router.post("/", userController.crearUsuario);
router.post("/login", userController.loginUsuario);

// Rutas protegidas
router.get("/", verifyToken, userController.obtenerUsuarios);
router.patch('/:id/password', verifyToken, userController.cambiarPassword);
router.patch("/:id", verifyToken, userController.cambiarUsuario);
router.delete("/:id", verifyToken, userController.eliminarUsuario);


module.exports = router;
