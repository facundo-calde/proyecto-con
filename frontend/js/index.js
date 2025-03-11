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
                    seleccionarCaja(); // Mostrar opción de Caja
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

    // **Función para mostrar selección de Caja y guardarla en `localStorage`**
    function seleccionarCaja() {
        Swal.fire({
            title: "Selecciona una Caja",
            input: "select",
            inputOptions: {
                "Caja 1": "Caja 1",
                "Caja 2": "Caja 2"
            },
            inputPlaceholder: "Elige una opción",
            showCancelButton: false,
            confirmButtonText: "Ingresar",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem("cajaSeleccionada", result.value); // ✅ Guardar en `localStorage`
                console.log("📌 Caja seleccionada:", result.value);
                
                // **Redirigir según la caja elegida**
                window.location.href = result.value === "Caja 1" ? "dashboard1.html" : "dashboard2.html";
            }
        });
    }
});

