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

        // **Verificar si el usuario está activo**
        if (!usuario.estado) {
            return res.status(403).json({ error: "Tu cuenta está inactiva. No puedes iniciar sesión." });
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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token no proporcionado o malformado" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const usuarioVerificado = jwt.verify(token, SECRET_KEY);
        req.user = usuarioVerificado;  // Guarda la información del usuario en req.user
        next();  // Llama al siguiente middleware
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado" });
    }
};

//Modificar contraseña
const cambiarPassword = async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
  
    if (!oldPassword || !newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: "Debes ingresar ambas contraseñas correctamente" });
    }
  
    try {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
  
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "La contraseña actual es incorrecta" });
      }
  
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      await user.save();
  
      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("❌ Error en cambio de contraseña:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };
  
  //Modificar usuario
  const cambiarEstadoUsuario = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      user.estado = estado;
      await user.save();
  
      res.json({ message: "Estado de usuario actualizado", user });
    } catch (error) {
      console.error("❌ Error al actualizar el estado del usuario:", error);
      res.status(500).json({ message: "Error al actualizar el estado del usuario" });
    }
  };
  
 

  module.exports = {
    obtenerUsuarios,
    crearUsuario,
    loginUsuario,
    verificarToken,
    cambiarEstadoUsuario,
    cambiarPassword
  };
  
