const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Definir rutas para los puestos de trabajo
router.get('/', jobController.getAllJobs); // Obtener todos los puestos
router.get('/:id', jobController.getJobById); // Obtener un puesto por ID
router.post('/', jobController.createJob); // Crear un nuevo puesto con su caja de fichas
router.put('/:id', jobController.updateJob); // Modificar un puesto
router.delete('/:id', jobController.deleteJob); // Eliminar un puesto
router.patch('/:id/movimiento', jobController.modificarFichasPorDelta);


module.exports = router;
