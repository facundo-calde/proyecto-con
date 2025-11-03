// dashboardController.js actualizado con filtrado dinámico basado en texto para movimientos embebidos

const Bill = require('../models/bills');
const OfficeExpense = require('../models/OfficeExpenses');
const Tip = require("../models/tips");
const Movement = require("../models/movement");
const Wallet = require("../models/Wallet");
const Job = require("../models/Job");

// Utilidad para armar filtros
const construirFiltros = (query) => {
  const filtros = {};
  if (query.startDate && query.endDate) {
    filtros.fecha = {
      $gte: new Date(query.startDate),
      $lte: new Date(query.endDate)
    };
  }
  if (query.usuario) filtros.usuario = query.usuario;
  if (query.billetera) filtros.wallet = query.billetera;
  return filtros;
};

// GET Controllers
exports.obtenerDepositos = async (req, res) => {
  try {
    const filtros = construirFiltros(req.query);
    const depositos = await Bill.find(filtros)
      .populate("usuario")
      .populate({
        path: "wallet",
        select: "nombre caja",
        populate: {
          path: "caja",
          select: "name"
        }
      });
    res.json(depositos);
  } catch (error) {
    console.error("Error al obtener depósitos:", error);
    res.status(500).json({ error: "Error al obtener depósitos" });
  }
};

exports.obtenerGastos = async (req, res) => {
  try {
    const filtros = construirFiltros(req.query);
    const gastos = await OfficeExpense.find(filtros)
      .populate("usuario")
      .populate("wallet", "nombre")
      .populate("job", "name");

    res.json(gastos);
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    res.status(500).json({ error: "Error al obtener gastos" });
  }
};


exports.obtenerPropinas = async (req, res) => {
  try {
    const filtros = construirFiltros(req.query);
    const propinas = await Tip.find(filtros).populate("usuario");
    res.json(propinas);
  } catch (error) {
    console.error("Error al obtener propinas:", error);
    res.status(500).json({ error: "Error al obtener propinas" });
  }
};

exports.obtenerTransferencias = async (req, res) => {
  try {
    const wallets = await Wallet.find({}, "movimientos nombre");
    const movimientos = [];

    wallets.forEach(w => {
      const filtrados = w.movimientos.filter(m => {
        return m.detalle?.toLowerCase().includes("transferencia") ||
               m.detalle?.toLowerCase().includes("entre billeteras") ||
               m.origen || m.destino;
      });

      filtrados.forEach(f => {
        movimientos.push({
          monto: f.monto,
          descripcion: f.detalle,
          fecha: f.fecha,
          usuario: { nombre: f.usuario },
          wallet: { nombre: w.nombre, _id: w._id },
          job: { name: f.origen || "N/A" }
        });
      });
    });

    res.json(movimientos);
  } catch (error) {
    console.error("Error al obtener transferencias:", error);
    res.status(500).json({ error: "Error al obtener transferencias" });
  }
};

exports.obtenerRecargas = async (req, res) => {
  try {
    const wallets = await Wallet.find({}, "movimientos nombre");
    const movimientos = [];

    wallets.forEach(w => {
      const filtrados = w.movimientos.filter(m => {
        return m.detalle?.toLowerCase().includes("recarga") ||
               m.detalle?.toLowerCase().includes("administrativa") ||
               m.tipo === "entrada" && m.detalle?.toLowerCase().includes("para un retiro");
      });

      filtrados.forEach(f => {
        movimientos.push({
          monto: f.monto,
          descripcion: f.detalle,
          fecha: f.fecha,
          usuario: { nombre: f.usuario },
          wallet: { nombre: w.nombre, _id: w._id },
          job: { name: f.origen || "N/A" }
        });
      });
    });

    res.json(movimientos);
  } catch (error) {
    console.error("Error al obtener recargas:", error);
    res.status(500).json({ error: "Error al obtener recargas" });
  }
};

// POST Controllers
exports.crearDeposito = async (req, res) => {
  try {
    const { monto, fecha, billeteraId } = req.body;
    
    if (!monto || isNaN(monto) || monto === 0) {
      return res.status(400).json({ error: "Ingresá un monto válido (positivo o negativo)" });
    }

    const usuario = req.user?.id;
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const wallet = await Wallet.findById(billeteraId);
    if (!wallet) return res.status(404).json({ error: "Billetera no encontrada" });

    wallet.saldo += monto; // 🔄 puede sumar o restar
    wallet.movimientos.push({
      tipo: monto > 0 ? "entrada" : "salida",
      monto,
      detalle: "modificación de saldo manual",
      fecha: fecha ? new Date(fecha) : new Date(),
      usuario: usuario.toString()
    });
    await wallet.save();

    const nuevoDeposito = new Bill({
      monto,
      fecha: fecha ? new Date(fecha) : new Date(),
      usuario,
      wallet: billeteraId
    });
    const depositoGuardado = await nuevoDeposito.save();

    res.status(201).json(depositoGuardado);
  } catch (error) {
    console.error("Error al crear depósito:", error);
    res.status(500).json({ error: "Error al crear depósito" });
  }
};


exports.crearGasto = async (req, res) => {
  try {
    const { monto, descripcion, fecha, walletId } = req.body;
    if (!monto || monto <= 0 || !descripcion || !walletId) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const usuario = req.user ? req.user.id : null;
    if (!usuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const wallet = await Wallet.findById(walletId).populate("caja");
    if (!wallet) return res.status(404).json({ error: "Billetera no encontrada" });

    // Descontar el monto de la billetera
    if (wallet.saldo < monto) return res.status(400).json({ error: "Saldo insuficiente en la billetera" });
    wallet.saldo -= monto;
    wallet.movimientos.push({
      tipo: "salida",
      monto,
      detalle: descripcion,
      fecha: fecha ? new Date(fecha) : new Date(),
      usuario
    });
    await wallet.save();

    const gasto = new OfficeExpense({
      monto,
      descripcion,
      fecha: fecha ? new Date(fecha) : new Date(),
      usuario,
      wallet: wallet._id,
      job: wallet.caja // ← guardar el puesto asociado a esa wallet
    });

    const guardado = await gasto.save();
    res.status(201).json(guardado);
  } catch (error) {
    console.error("Error al crear gasto de oficina:", error);
    res.status(500).json({ error: "Error al crear gasto de oficina" });
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
    const nuevaPropina = new Tip({ monto, descripcion: descripcion || "", fecha: fecha ? new Date(fecha) : new Date(), usuario });
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
    if (monto > 0) {
      wallet.saldo += monto;
      job.fichas -= monto;
    }
    if (monto < 0) {
      const absMonto = Math.abs(monto);
      if (wallet.saldo < absMonto) return res.status(400).json({ error: "Saldo insuficiente en wallet" });
      wallet.saldo -= absMonto;
      job.fichas += absMonto;
    }
    await wallet.save();
    await job.save();
    const nuevoMovimiento = new Movement({ monto, descripcion, wallet: walletId, job: jobId, usuario });
    const guardado = await nuevoMovimiento.save();
    res.status(201).json(guardado);
  } catch (error) {
    console.error("❌ Error al crear movimiento:", error);
    res.status(500).json({ error: "Error al crear movimiento" });
  }
};


