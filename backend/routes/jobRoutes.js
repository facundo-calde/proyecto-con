const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const verifyToken = require('../middlewares/verifyToken');

// Aplicar el middleware a todas las rutas de este router
router.use(verifyToken);

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.post('/', jobController.createJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
router.patch('/:id/movimiento', jobController.modificarFichasPorDelta);
router.post('/recarga-administrativa', jobController.recargaAdministrativa);

module.exports = router;



