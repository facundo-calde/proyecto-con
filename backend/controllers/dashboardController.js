// dashboardController.js

const Bill = require('../models/bills'); // Modelo para depósitos sin reclamar
const OfficeExpense = require('../models/OfficeExpenses'); // Modelo para gastos de oficina
const Tip = require("../models/tips");
const Movement = require("../models/movements");
const Wallet = require("../models/Wallet");
const Job = require("../models/Job");


// Crear un depósito sin reclamar incluyendo el usuario
exports.crearDeposito = async (req, res) => {
  try {
    const { monto, fecha } = req.body;
    // Validación simple
    if (!monto || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }
    
    // Obtener el usuario desde el middleware de autenticación
    // Asegúrate de que tu middleware asigne req.user
    const usuario = req.user ? req.user.id : null;
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const nuevoDeposito = new Bill({
      monto,
      fecha: fecha ? new Date(fecha) : new Date(),
      usuario
    });

    const depositoGuardado = await nuevoDeposito.save();
    return res.status(201).json(depositoGuardado);

  } catch (error) {
    console.error("Error al crear depósito:", error);
    return res.status(500).json({ error: "Error al crear depósito" });
  }
};

// Crear un gasto de oficina incluyendo el usuario
exports.crearGasto = async (req, res) => {
  try {
    const { monto, descripcion, fecha } = req.body;
    if (!monto || monto <= 0 || !descripcion) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    // 🔥 ESTA ES LA LÍNEA QUE TE ESTABA TIRANDO 401
    const usuario = req.user ? req.user.id : null;

    if (!usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const nuevoGasto = new OfficeExpense({
      monto,
      descripcion,
      fecha: fecha ? new Date(fecha) : new Date(),
      usuario
    });

    const gastoGuardado = await nuevoGasto.save();
    return res.status(201).json(gastoGuardado);

  } catch (error) {
    console.error("Error al crear gasto de oficina:", error);
    return res.status(500).json({ error: "Error al crear gasto de oficina" });
  }
};

exports.crearPropina = async (req, res) => {
  try {
    const { monto, descripcion, fecha } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const usuario = req.user ? req.user.id : null;
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const nuevaPropina = new Tip({
      monto,
      descripcion: descripcion || "",
      fecha: fecha ? new Date(fecha) : new Date(),
      usuario
    });

    const propinaGuardada = await nuevaPropina.save();
    return res.status(201).json(propinaGuardada);

  } catch (error) {
    console.error("❌ Error al crear propina:", error);
    return res.status(500).json({ error: "Error al crear propina" });
  }
};

exports.crearMovimiento = async (req, res) => {
  try {
    const { monto, descripcion, walletId, jobId } = req.body;
    const usuario = req.user ? req.user.id : null;

    if (!usuario) return res.status(401).json({ error: "Usuario no autenticado" });
    if (!walletId || !jobId || !monto) return res.status(400).json({ error: "Datos incompletos" });

    const wallet = await Wallet.findById(walletId);
    const job = await Job.findById(jobId);

    if (!wallet || !job) return res.status(404).json({ error: "Wallet o Job no encontrado" });

    // Movimiento positivo → suma a wallet, resta a job
    if (monto > 0) {
      wallet.saldo += monto;
      job.fichas -= monto;
    }

    // Movimiento negativo → resta a wallet, suma a job
    if (monto < 0) {
      const absMonto = Math.abs(monto);
      if (wallet.saldo < absMonto) return res.status(400).json({ error: "Saldo insuficiente en wallet" });
      wallet.saldo -= absMonto;
      job.fichas += absMonto;
    }

    // Guardar cambios
    await wallet.save();
    await job.save();

    // Registrar el movimiento
    const nuevoMovimiento = new Movement({
      monto,
      descripcion,
      wallet: walletId,
      job: jobId,
      usuario
    });

    const guardado = await nuevoMovimiento.save();
    res.status(201).json(guardado);

  } catch (error) {
    console.error("❌ Error al crear movimiento:", error);
    res.status(500).json({ error: "Error al crear movimiento" });
  }
};

