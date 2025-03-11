document.addEventListener("DOMContentLoaded", function () {
    // **CONFIGURACIÓN**
    const API_WALLETS = "http://localhost:5000/api/wallets"; // URL de la API para wallets
    const API_USERS = "http://localhost:5000/api/users"; // URL de la API para usuarios
    const usuarioSpan = document.querySelector(".textWhite strong"); // Capturar el elemento donde va el nombre
    const logoutBtn = document.querySelector(".logout"); // Capturar el botón de cerrar sesión

    // **Mostrar el nombre del usuario en la navbar**
    function mostrarNombreUsuario() {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1])); // Decodificar JWT
                console.log("🔍 Datos del usuario:", payload);
                usuarioSpan.textContent = payload.nombre.toUpperCase(); // Mostrar nombre en navbar
            } catch (error) {
                console.error("❌ Error al decodificar el token:", error);
                usuarioSpan.textContent = "USUARIO";
            }
        } else {
            console.warn("⚠️ No se encontró un token en localStorage");
            usuarioSpan.textContent = "USUARIO";
        }
    }

    // **Evento para cerrar sesión**
    if (logoutBtn) {
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
                    localStorage.removeItem("token"); // Eliminar token
                    window.location.href = "index.html"; // Redirigir a index.html
                }
            });
        });
    }

    // **Eventos para agregar Wallet**
    const btnAgregarWallet = document.getElementById("agregarWallet");
    if (btnAgregarWallet) {
        btnAgregarWallet.addEventListener("click", async function (event) {
            event.preventDefault();

            const { value: formValues } = await Swal.fire({
                title: "Agregar Nueva Wallet",
                html:
                    `<input id="swal-nombre-wallet" class="swal2-input" placeholder="Nombre de la Wallet">` +
                    `<select id="swal-caja-wallet" class="swal2-input">
                        <option value="Caja 1">Caja 1</option>
                        <option value="Caja 2">Caja 2</option>
                     </select>`,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Agregar",
                cancelButtonText: "Cancelar",
                preConfirm: () => {
                    return {
                        nombre: document.getElementById("swal-nombre-wallet").value.trim(),
                        caja: document.getElementById("swal-caja-wallet").value
                    };
                }
            });

            if (formValues) {
                if (!formValues.nombre) {
                    Swal.fire("Error", "El nombre de la Wallet no puede estar vacío", "error");
                    return;
                }

                const nuevaWallet = { nombre: formValues.nombre, caja: formValues.caja, saldo: 0 };

                try {
                    Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                    const response = await fetch(API_WALLETS, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(nuevaWallet)
                    });

                    if (response.ok) {
                        Swal.fire("✅ Wallet Agregada", `Se agregó a ${formValues.caja}`, "success");
                    } else {
                        const errorData = await response.json();
                        Swal.fire("❌ Error", errorData.error || "No se pudo agregar la wallet", "error");
                    }
                } catch (error) {
                    console.error("❌ Error en la solicitud:", error);
                    Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
                }
            }
        });
    }

    // **Eventos para agregar Usuario**
    const btnAgregarUsuario = document.getElementById("agregarUsuario");
    if (btnAgregarUsuario) {
        btnAgregarUsuario.addEventListener("click", async function (event) {
            event.preventDefault();

            const { value: formValues } = await Swal.fire({
                title: "Agregar Nuevo Usuario",
                html:
                    `<input id="swal-nombre-usuario" class="swal2-input" placeholder="Nombre de Usuario">` +
                    `<input id="swal-password-usuario" type="password" class="swal2-input" placeholder="Contraseña">` +
                    `<select id="swal-rol-usuario" class="swal2-input">
                        <option value="Administrador">Administrador</option>
                        <option value="Cajero">Cajero</option>
                     </select>`,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: "Agregar",
                cancelButtonText: "Cancelar",
                preConfirm: () => {
                    return {
                        nombre: document.getElementById("swal-nombre-usuario").value.trim(),
                        password: document.getElementById("swal-password-usuario").value.trim(),
                        rol: document.getElementById("swal-rol-usuario").value
                    };
                }
            });

            if (formValues) {
                if (!formValues.nombre || !formValues.password) {
                    Swal.fire("Error", "El nombre y la contraseña son obligatorios", "error");
                    return;
                }

                const nuevoUsuario = { nombre: formValues.nombre, password: formValues.password, rol: formValues.rol };
                console.log("📤 Enviando usuario:", nuevoUsuario);

                try {
                    Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

                    const response = await fetch(API_USERS, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(nuevoUsuario)
                    });

                    const responseData = await response.json();
                    console.log("📥 Respuesta del servidor:", responseData);

                    if (response.ok) {
                        Swal.fire("✅ Usuario Agregado", "Se ha registrado correctamente", "success");
                    } else {
                        Swal.fire("❌ Error", responseData.error || "No se pudo agregar el usuario", "error");
                    }
                } catch (error) {
                    console.error("❌ Error en la solicitud:", error);
                    Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
                }
            }
        });
    }

    // **Ejecutar funciones al cargar la página**
    mostrarNombreUsuario();
});





