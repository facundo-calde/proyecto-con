const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "secreto_super_seguro"; // Usa un secreto fuerte en producción

// **Obtener todos los usuarios**
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find().select("-password"); // No enviamos las contraseñas
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
};

// **Registrar un nuevo usuario**
const crearUsuario = async (req, res) => {
    try {
        console.log("📥 Datos recibidos:", req.body); // 🔍 Ver qué está recibiendo el servidor

        const { nombre, password, rol } = req.body;

        if (!nombre || !password || !rol) {
            console.log("❌ Error: Falta algún campo"); // 🔍 Mensaje en la terminal si falta un campo
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        // **Verificar si el usuario ya existe**
        const usuarioExistente = await User.findOne({ nombre });
        if (usuarioExistente) {
            console.log("⚠️ El usuario ya existe");
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        // **Hashear la contraseña**
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // **Crear usuario**
        const nuevoUsuario = new User({
            nombre,
            password: hashedPassword, // Guardamos la contraseña hasheada
            rol
        });

        await nuevoUsuario.save();
        console.log("✅ Usuario registrado correctamente");

        res.status(201).json({ message: "Usuario registrado correctamente" });

    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

// **Iniciar sesión y obtener JWT**
const loginUsuario = async (req, res) => {
    try {
        const { nombre, password } = req.body;

        // **Verificar si el usuario existe**
        const usuario = await User.findOne({ nombre });
        if (!usuario) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        }

        // **Comparar la contraseña**
        const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!esPasswordCorrecto) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        }

        // **Generar el Token JWT**
        const token = jwt.sign(
            { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol },
            SECRET_KEY,
            { expiresIn: "8h" }
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};

// **Middleware para verificar el token**
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("🔐 Header recibido:", authHeader); // 👈 log del header

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ Token no presente o malformado");
        return res.status(401).json({ error: "Token no proporcionado o malformado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const usuarioVerificado = jwt.verify(token, SECRET_KEY);
        console.log("✅ Token válido. Usuario:", usuarioVerificado); // 👈 log del contenido
        req.user = usuarioVerificado;
        next();
    } catch (error) {
        console.log("❌ Token inválido:", error.message); // 👈 error exacto
        res.status(401).json({ error: "Token inválido o expirado" });
    }
};



module.exports = {
    obtenerUsuarios,
    crearUsuario,
    loginUsuario,
    verificarToken
};
