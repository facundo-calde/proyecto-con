const express = require("express");
const router = express.Router();
const { crearDeposito, crearGasto } = require("../controllers/dashboardController");
const { crearPropina } = require("../controllers/dashboardController");
const { crearMovimiento } = require("../controllers/dashboardController");
const { verificarToken } = require("../controllers/userController");

router.use(verificarToken); // ✅ aplica a todas

router.post("/depositos", crearDeposito);
router.post("/gastos", crearGasto);
router.post("/propinas", crearPropina);
router.post("/movimientos", crearMovimiento);


module.exports = router;
