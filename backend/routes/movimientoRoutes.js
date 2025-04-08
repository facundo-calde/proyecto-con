const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');

// Ruta para obtener los movimientos
router.get("/", movimientoController.obtenerMovimientos); // Asegúrate de que esta ruta esté configurada correctamente

module.exports = router;
