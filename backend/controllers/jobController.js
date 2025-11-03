const Job = require('../models/Job');

// Obtener todos los puestos de trabajo
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        console.error("❌ Error en getAllJobs:", error);
        res.status(500).json({ message: "Error al obtener los puestos de trabajo", error });
    }
};

// Obtener un puesto de trabajo por ID
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Puesto no encontrado" });
        res.json(job);
    } catch (error) {
        console.error("❌ Error en getJobById:", error);
        res.status(500).json({ message: "Error al obtener el puesto de trabajo", error });
    }
};

// Crear un nuevo puesto de trabajo con nombre y fichas
exports.createJob = async (req, res) => {
    try {
        console.log("📥 Datos recibidos en /api/jobs:", req.body);
        const { name, initialFichas } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "El nombre es obligatorio" });
        }
        
        // Si initialFichas no se envía o es inválido, se asigna 0 por defecto
        const fichas = (initialFichas === undefined || isNaN(initialFichas))
            ? 0
            : Number(initialFichas);
        
        const newJob = new Job({
            name,
            fichas
        });
        await newJob.save();
        
        res.status(201).json({ message: "Puesto creado con éxito", job: newJob });
    } catch (error) {
        console.error("❌ Error en createJob:", error);
        res.status(500).json({ message: "Error al crear el puesto", error });
    }
};

// Modificar un puesto de trabajo (actualizando nombre y/o fichas)
exports.updateJob = async (req, res) => {
    try {
        const { name, fichas } = req.body;
        const job = await Job.findByIdAndUpdate(req.params.id, { name, fichas }, { new: true });
        if (!job) return res.status(404).json({ message: "Puesto no encontrado" });
        res.json(job);
    } catch (error) {
        console.error("❌ Error en updateJob:", error);
        res.status(500).json({ message: "Error al actualizar el puesto", error });
    }
};

// Eliminar un puesto de trabajo
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ message: "Puesto no encontrado" });
        res.json({ message: "Puesto eliminado con éxito" });
    } catch (error) {
        console.error("❌ Error en deleteJob:", error);
        res.status(500).json({ message: "Error al eliminar el puesto", error });
    }
};

exports.modificarFichasPorDelta = async (req, res) => {
    const { id } = req.params;
    const { deltaFichas } = req.body;
  
    if (typeof deltaFichas !== "number") {
      return res.status(400).json({ message: "El valor debe ser numérico" });
    }
  
    try {
      const job = await Job.findById(id);
      if (!job) return res.status(404).json({ message: "Puesto no encontrado" });
  
      job.fichas += deltaFichas;
      await job.save();
  
      res.json({ message: "Fichas actualizadas", fichas: job.fichas });
    } catch (err) {
      console.error("❌ Error en el servidor:", err);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };
  
  exports.recargaAdministrativa = async (req, res) => {
    const { jobId, monto, detalle } = req.body;
  
    if (!jobId || typeof monto !== 'number' || !detalle?.trim()) {
      return res.status(400).json({ message: "Datos inválidos para la recarga" });
    }
  
    try {
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: "Puesto no encontrado" });
  
      job.fichas += monto;
      await job.save();
  
      res.json({ message: "Recarga aplicada correctamente", fichasActuales: job.fichas });
    } catch (error) {
      console.error("❌ Error en recargaAdministrativa:", error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };
  
  


