const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

const walletRoutes = require("./routes/walletRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000; // Usa el puerto de .env o 5000 por defecto
const mongoURI = process.env.MONGO_URI;

app.use(express.json());
app.use(cors());

console.log("🔍 MONGO_URI:", mongoURI);
console.log("🚀 Usando puerto:", PORT);

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI no está definido en .env");
    process.exit(1);
}

// **Conectar a MongoDB**
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => {
        console.error("❌ Error al conectar a MongoDB:", err);
        process.exit(1);
    });

// **Rutas**
app.use("/api/wallets", walletRoutes);
app.use("/api/users", userRoutes);

// **Iniciar servidor**
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});


