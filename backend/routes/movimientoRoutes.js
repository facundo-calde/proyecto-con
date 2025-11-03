const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const verifyToken = require('../middlewares/verifyToken');

// Aplicar middleware a todas las rutas del router
router.use(verifyToken);

router.get("/", movimientoController.obtenerMovimientos);

module.exports = router;
