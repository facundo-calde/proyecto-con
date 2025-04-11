const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const walletRoutes = require("./routes/walletRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const movimientoRoutes = require("./routes/movimientoRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const verifyToken = require("./middlewares/verifyToken"); // <-- 👈 IMPORTANTE

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";
const mongoURI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());

console.log("🔍 MONGO_URI:", mongoURI);
console.log("🚀 Usando puerto:", PORT);
console.log("🌐 Host:", HOST);

if (!mongoURI) {
  console.error("❌ ERROR: MONGO_URI no está definido en .env");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => {
    console.error("❌ Error al conectar a MongoDB:", err);
    process.exit(1);
  });

// 🔓 Rutas públicas (sin token)
app.use("/api/users", userRoutes); // login, registro, etc.

// 🔒 Rutas protegidas
app.use("/api/wallets", verifyToken, walletRoutes);
app.use("/api/jobs", verifyToken, jobRoutes);
app.use("/api/movimientos", verifyToken, movimientoRoutes);
app.use("/api", verifyToken, dashboardRoutes); // Si querés que todo /api/* esté protegido

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor en http://${HOST}:${PORT}`);
});



