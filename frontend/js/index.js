function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire("Error", "Token no encontrado. Iniciá sesión nuevamente.", "error");
    throw new Error("Token no encontrado");
  }
  return token;
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("form");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Evita que la página se recargue

    const nombre = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!nombre || !password) {
      Swal.fire("Error", "Por favor, ingresa usuario y contraseña", "error");
      return;
    }

    try {
      Swal.fire({ title: "Verificando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, password })
      });

      const data = await response.json();
      console.log("📥 Respuesta del servidor:", data); // 🔍 Ver la respuesta en la consola

      if (response.ok) {
        Swal.close(); // Cierra la alerta de carga

        const { token } = data;
        localStorage.setItem("token", token); // Guarda el token en localStorage

        // **Decodificar el token para obtener el rol del usuario**
        const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica el JWT
        console.log("🔍 Datos del usuario:", payload);

        const rol = payload.rol;

        if (rol === "Administrador") {
          window.location.href = "dashboardAdmin.html"; // Redirige a Admin
        } else if (rol === "Cajero") {
          seleccionarCaja(); // Mostrar opción de Caja
        } else {
          Swal.fire("Error", "Rol no válido", "error");
        }

      } else if (response.status === 403) {
        Swal.fire("❌ Usuario Inactivo", "Tu cuenta está inactiva. No puedes iniciar sesión.", "error");
      } else {
        Swal.fire("❌ Error", data.error || "Usuario o contraseña incorrectos", "error");
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
      Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
    }
  });

  async function seleccionarCaja() {
    try {
      const token = getToken(); // ✅ Token desde helper
      const response = await fetch("http://localhost:5000/api/jobs", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const jobs = await response.json();

      if (!Array.isArray(jobs) || !jobs.length) {
        Swal.fire("⚠️ Sin Puestos", "No hay puestos de trabajo registrados.", "warning");
        return;
      }

      const inputOptions = {};
      jobs.forEach(job => {
        inputOptions[job._id] = job.name;
      });

      const { value: selectedJobId } = await Swal.fire({
        title: "Selecciona un Puesto",
        input: "select",
        inputOptions: inputOptions,
        inputPlaceholder: "Elige un Puesto",
        showCancelButton: false,
        confirmButtonText: "Ingresar",
        allowOutsideClick: false
      });

      if (selectedJobId) {
        localStorage.setItem("puestoSeleccionado", selectedJobId);
        console.log("📌 Puesto seleccionado:", selectedJobId);
        window.location.href = "dashboard1.html";
      }

    } catch (error) {
      console.error("❌ Error al obtener los puestos:", error);
      Swal.fire("❌ Error", "No se pudo obtener la lista de puestos", "error");
    }
  }
});




