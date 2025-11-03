const express = require("express");
const router = express.Router();

const {
  crearDeposito,
  crearGasto,
  crearPropina,
  crearMovimiento,
  obtenerDepositos,
  obtenerGastos,
  obtenerPropinas,
  obtenerTransferencias,
  obtenerRecargas
} = require("../controllers/dashboardController");

const verifyToken = require("../middlewares/verifyToken");

// Proteger todas las rutas del dashboard
router.use(verifyToken);

// POST - Crear registros
router.post("/depositos", crearDeposito);
router.post("/gastos", crearGasto);
router.post("/propinas", crearPropina);
router.post("/movimientos", crearMovimiento);

// GET - Obtener reportes
router.get("/depositos", obtenerDepositos);
router.get("/gastos", obtenerGastos);
router.get("/propinas", obtenerPropinas);
router.get("/wallets/transferencias", obtenerTransferencias);
router.get("/wallets/recargas-administrativas", obtenerRecargas);

module.exports = router;


