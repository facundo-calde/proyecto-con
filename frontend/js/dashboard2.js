document.addEventListener("DOMContentLoaded", function () {
    const listaBilleteras = document.getElementById("listaBilleteras");
    const usuarioSpan = document.querySelector(".textWhite strong"); // Capturar el elemento donde va el nombre
    const logoutBtn = document.querySelector(".logout"); // Capturar el botón de cerrar sesión
    const API_URL_BILLETERAS = "http://localhost:5000/api/wallets"; // Endpoint de billeteras

    // **Obtener el nombre del usuario desde el token**
    function mostrarNombreUsuario() {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1])); // Decodificar JWT
                console.log("🔍 Datos del usuario:", payload);
                usuarioSpan.textContent = payload.nombre.toUpperCase(); // Mostrar el nombre en la navbar
            } catch (error) {
                console.error("❌ Error al decodificar el token:", error);
                usuarioSpan.textContent = "USUARIO"; // Si hay error, dejar el texto por defecto
            }
        } else {
            console.warn("⚠️ No se encontró un token en localStorage");
            usuarioSpan.textContent = "USUARIO";
        }
    }

    // **Obtener la caja seleccionada (Caja 1 o Caja 2)**
    function obtenerCajaSeleccionada() {
        const caja = localStorage.getItem("cajaSeleccionada");
        console.log("📌 Caja seleccionada:", caja);
        return caja || "Caja 1"; // Si no hay valor, por defecto "Caja 1"
    }

    // **Cargar billeteras filtradas por caja**
    async function cargarBilleteras() {
        const cajaSeleccionada = localStorage.getItem("cajaSeleccionada") || "Caja 1"; // Recupera la caja guardada
    
        console.log("📌 Caja seleccionada al cargar billeteras:", cajaSeleccionada);
    
        try {
            const response = await fetch(API_URL_BILLETERAS);
            const billeteras = await response.json();
            listaBilleteras.innerHTML = ""; // Limpiar lista antes de actualizar
    
            // Filtrar billeteras según la caja seleccionada
            const billeterasFiltradas = billeteras.filter(billetera => billetera.caja === cajaSeleccionada);
    
            if (billeterasFiltradas.length === 0) {
                listaBilleteras.innerHTML = `<li>No hay billeteras en ${cajaSeleccionada}.</li>`;
            } else {
                billeterasFiltradas.forEach(billetera => {
                    let li = document.createElement("li");
                    li.innerHTML = `<strong>${billetera.nombre}:</strong> $${billetera.saldo.toFixed(2)}`;
                    listaBilleteras.appendChild(li);
                });
            }
        } catch (error) {
            console.error("❌ Error al cargar billeteras:", error);
            listaBilleteras.innerHTML = `<li>Error al cargar billeteras.</li>`;
        }
    }
    
    

    // **Cerrar sesión (Eliminar token y caja seleccionada)**
    logoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        console.log("🔍 Click en CERRAR SESIÓN");

        Swal.fire({
            title: "¿Cerrar sesión?",
            text: "Se eliminará la sesión y serás redirigido a la página de inicio.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("✅ Confirmación recibida, eliminando token...");
                localStorage.removeItem("token"); // Eliminar el token del localStorage
                localStorage.removeItem("cajaSeleccionada"); // Eliminar caja seleccionada
                window.location.href = "index.html"; // Redirigir a index.html
            }
        });
    });

    // **Ejecutar funciones al cargar la página**
    mostrarNombreUsuario();
    cargarBilleteras();
});
