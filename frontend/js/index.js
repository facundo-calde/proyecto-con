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
                console.log("🔍 Datos del usuario:", payload); // Muestra los datos en la consola

                const rol = payload.rol;

                if (rol === "Administrador") {
                    window.location.href = "dashboardAdmin.html"; // Redirige a Admin
                } else if (rol === "Cajero") {
                    seleccionarCaja(); // Mostrar opción de Caja (en este caso, puestos de trabajo)
                } else {
                    Swal.fire("Error", "Rol no válido", "error");
                }

            } else {
                Swal.fire("❌ Error", data.error || "Usuario o contraseña incorrectos", "error");
            }
        } catch (error) {
            console.error("❌ Error en la solicitud:", error);
            Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
        }
    });

    // **Función para mostrar selección de Puesto (Job) y guardarlo en `localStorage`**
    async function seleccionarCaja() {
        try {
            // 1. Obtener la lista de jobs desde el backend
            const response = await fetch("http://localhost:5000/api/jobs");
            const jobs = await response.json();

            if (!Array.isArray(jobs) || !jobs.length) {
                // Si no hay puestos, mostrar un mensaje y no continuar
                Swal.fire("⚠️ Sin Puestos", "No hay puestos de trabajo registrados.", "warning");
                return;
            }

            // 2. Construir un objeto para las opciones del select de SweetAlert
            //    { jobId: jobName }
            const inputOptions = {};
            jobs.forEach(job => {
                inputOptions[job._id] = job.name; // { "645ddf...": "Puesto 1", ... }
            });

            // 3. Mostrar el SweetAlert con un select dinámico
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
                // Guardar en localStorage para usarlo luego
                localStorage.setItem("puestoSeleccionado", selectedJobId);
                console.log("📌 Puesto seleccionado:", selectedJobId);

                // 4. Redirigir según el puesto elegido (ejemplo)
                //    Ajusta las redirecciones según tu lógica
                window.location.href = "dashboard1.html";
            }

        } catch (error) {
            console.error("❌ Error al obtener los puestos:", error);
            Swal.fire("❌ Error", "No se pudo obtener la lista de puestos", "error");
        }
    }
});


