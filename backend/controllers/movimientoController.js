const mongoose = require('mongoose'); // Asegúrate de tener esta importación
const Movement = require('../models/movement'); // Asegúrate de importar correctamente el modelo de movimientos

// Función para obtener los movimientos filtrados
exports.obtenerMovimientos = async (req, res) => {
  const { startDate, endDate, billetera, puesto } = req.query;
  console.log("Filtros recibidos:", { startDate, endDate, billetera, puesto });

  let query = {};

  // Convertir las fechas de inicio y fin a objetos Date
  if (startDate) query.fecha = { $gte: new Date(startDate) };
  if (endDate) query.fecha = { ...query.fecha, $lte: new Date(endDate) };

  // Filtros de billetera y puesto
  if (billetera) query.wallet = new mongoose.Types.ObjectId(billetera); // Cambié esto a new
  if (puesto) query.job = new mongoose.Types.ObjectId(puesto); // Cambié esto a new

  try {
    const movimientos = await Movement.find(query)
      .populate('usuario', 'nombre')
      .populate('job', 'name')
      .populate('wallet', 'nombre');

    console.log("Movimientos encontrados:", movimientos); // Verifica si se encuentran movimientos

    return res.json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return res.status(500).json({ message: "Error al obtener los movimientos." });
  }
};






