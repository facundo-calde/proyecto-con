const Wallet = require("../models/Wallet");

// **Obtener todas las wallets**
const obtenerWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find();
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las wallets" });
    }
};

// **Crear una nueva wallet con caja**
const crearWallet = async (req, res) => {
    try {
        const { nombre, saldo, caja } = req.body;
        if (!nombre || !caja) {
            return res.status(400).json({ error: "El nombre y la caja son obligatorios" });
        }

        const nuevaWallet = new Wallet({ nombre, saldo, caja });
        await nuevaWallet.save();
        res.status(201).json(nuevaWallet);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar la wallet" });
    }
};

// **Eliminar una wallet**
const eliminarWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await Wallet.findByIdAndDelete(id);

    if (!wallet) {
      return res.status(404).json({ message: "Wallet no encontrada" });
    }

    res.json({ message: "Wallet eliminada con éxito" });
  } catch (error) {
    console.error("❌ Error al eliminar wallet:", error);
    res.status(500).json({ message: "Error al eliminar la wallet" });
  }
};
  

//Transferir entre billeteras
const transferirEntreBilleteras = async (req, res) => {
    const { origen, destino, monto, detalle } = req.body;

    if (!origen || !destino || !monto || monto <= 0) {
        return res.status(400).json({ message: "Datos incompletos o inválidos" });
    }

    if (origen === destino) {
        return res.status(400).json({ message: "No se puede transferir a la misma billetera" });
    }

    try {
        const walletOrigen = await Wallet.findById(origen);
        const walletDestino = await Wallet.findById(destino);

        if (!walletOrigen || !walletDestino) {
            return res.status(404).json({ message: "Una de las billeteras no existe" });
        }

        if (walletOrigen.saldo < monto) {
            return res.status(400).json({ message: "Saldo insuficiente en la billetera origen" });
        }

        // Realizar la transferencia
        walletOrigen.saldo -= monto;
        walletDestino.saldo += monto;

        // Opcional: agregar movimientos si tenés ese campo
        const movimiento = {
            tipo: "transferencia",
            monto,
            detalle: detalle || `Transferencia de ${walletOrigen.nombre} a ${walletDestino.nombre}`,
            fecha: new Date(),
            usuario: req.user?.nombre || "Sistema"
        };

        // Si querés guardar un historial, descomentalo y asegurate que `movimientos` exista en el modelo
        walletOrigen.movimientos = walletOrigen.movimientos || [];
        walletDestino.movimientos = walletDestino.movimientos || [];

        walletOrigen.movimientos.push({ ...movimiento, tipo: "salida" });
        walletDestino.movimientos.push({ ...movimiento, tipo: "entrada" });

        await walletOrigen.save();
        await walletDestino.save();

        res.json({ message: "Transferencia realizada con éxito" });
    } catch (error) {
        console.error("❌ Error en transferencia:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

//modificar billetera
// Modificar el saldo de una wallet (sumar o restar)
const modificarSaldoWallet = async (req, res) => {
    const { id } = req.params;
    const { monto, descripcion } = req.body;
  
    if (typeof monto !== "number") {
      return res.status(400).json({ message: "El monto debe ser un número" });
    }
  
    try {
      const wallet = await Wallet.findById(id);
      if (!wallet) {
        return res.status(404).json({ message: "Billetera no encontrada" });
      }
  
      // Sumar o restar el monto
      wallet.saldo += monto;
  
      // Registrar movimiento (opcional)
      wallet.movimientos = wallet.movimientos || [];
      wallet.movimientos.push({
        tipo: monto >= 0 ? "entrada" : "salida",
        monto: Math.abs(monto),
        detalle: descripcion || "Modificación manual",
        fecha: new Date(),
        usuario: req.user?.nombre || "Sistema"
      });
  
      await wallet.save();
  
      res.json({ message: "Saldo modificado correctamente", wallet });
    } catch (error) {
      console.error("❌ Error al modificar el saldo:", error);
      res.status(500).json({ message: "Error al modificar el saldo" });
    }
  };

// **Exportar todas las funciones correctamente**
module.exports = {
    obtenerWallets,
    crearWallet,
    eliminarWallet,
    transferirEntreBilleteras,
    modificarSaldoWallet,
};


