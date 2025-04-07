document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM completamente cargado");

    // **CONFIGURACIÓN** - Estas variables serán visibles en este bloque
    const API_WALLETS = "http://localhost:5000/api/wallets";
    const API_USERS   = "http://localhost:5000/api/users";
    const API_JOBS    = "http://localhost:5000/api/jobs";

    const usuarioSpan = document.querySelector(".textWhite strong");
    const logoutBtn   = document.querySelector(".logout");

   // **Mostrar el nombre del usuario en la navbar**
function mostrarNombreUsuario() {
    const token = localStorage.getItem("token");

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            console.log("🔍 Datos del usuario:", payload);
            usuarioSpan.textContent = payload.nombre.toUpperCase();
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
                localStorage.removeItem("token");
                window.location.href = "index.html";
            }
        });
    });
}

// **Eventos para agregar Wallet, Usuario y Puesto de Trabajo**
function asignarEventos() {
    const btnAgregarWallet = document.getElementById("agregarWallet");
    const btnAgregarUsuario = document.getElementById("agregarUsuario");
    const btnAgregarPuesto = document.querySelector(".add-job");

    if (btnAgregarWallet) {
        btnAgregarWallet.addEventListener("click", async function (event) {
            event.preventDefault();
            console.log("✅ Click en 'Agregar Wallet' detectado.");
            
            try {
                // Obtener la lista de puestos (jobs) del backend
                const jobResponse = await fetch(API_JOBS);
                const jobs = await jobResponse.json();
    
                // Construir las opciones dinámicas para el select usando los jobs obtenidos
                let optionsHtml = "";
                if (Array.isArray(jobs) && jobs.length > 0) {
                    jobs.forEach(job => {
                        optionsHtml += `<option value="${job._id}">${job.name}</option>`;
                    });
                } else {
                    optionsHtml = `<option value="">No hay puestos</option>`;
                }
                
                // Mostrar SweetAlert para crear la wallet con un input para el nombre y un select para el job
                const { value: walletData } = await Swal.fire({
                    title: "Agregar Nueva Wallet",
                    html:
                        `<input id='swal-nombre-wallet' class='swal2-input' placeholder='Nombre de la Wallet'>` +
                        `<select id='swal-caja-wallet' class='swal2-input'>${optionsHtml}</select>`,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: "Agregar",
                    cancelButtonText: "Cancelar",
                    preConfirm: () => {
                        return {
                            nombre: document.getElementById("swal-nombre-wallet").value.trim(),
                            // Aquí se guarda el id del job seleccionado
                            caja: document.getElementById("swal-caja-wallet").value
                        };
                    }
                });
        
                if (!walletData || !walletData.nombre) {
                    Swal.fire("Error", "El nombre de la Wallet no puede estar vacío", "error");
                    return;
                }
        
                Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                const response = await fetch(API_WALLETS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(walletData)
                });
        
                const data = await response.json();
                if (response.ok) {
                    Swal.fire("✅ Wallet Agregada", `Se agregó la wallet asignada al puesto seleccionado`, "success");
                } else {
                    Swal.fire("❌ Error", data.message || "No se pudo agregar la wallet", "error");
                }
            } catch (error) {
                console.error("❌ Error en la solicitud:", error);
                Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
            }
        });
    }
    

    if (btnAgregarPuesto) {
        btnAgregarPuesto.addEventListener("click", async function (event) {
            event.preventDefault();
            console.log("✅ Click en 'Agregar Puesto de Trabajo' detectado.");
    
            const { value: jobName } = await Swal.fire({
                title: "Agregar Puesto de Trabajo",
                input: "text",
                inputLabel: "Nombre del Puesto",
                showCancelButton: true,
                confirmButtonText: "Agregar",
                cancelButtonText: "Cancelar",
                inputValidator: (value) => {
                    if (!value) return "Debes ingresar un nombre para el puesto!";
                }
            });
    
            if (!jobName) {
                console.log("❌ No se ingresó un nombre.");
                return;
            }
    
            try {
                Swal.fire({ 
                    title: "Guardando...", 
                    allowOutsideClick: false, 
                    didOpen: () => Swal.showLoading() 
                });
    
                // Envía 'initialQuantity' con valor 0
                const response = await fetch(API_JOBS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: jobName, initialQuantity: 0 })
                });
    
                const data = await response.json();
                if (response.ok) {
                    Swal.fire("✅ Puesto Agregado", `Se creó el puesto ${jobName} con su caja de fichas`, "success");
                } else {
                    Swal.fire("❌ Error", data.message || "No se pudo agregar el puesto", "error");
                }
            } catch (error) {
                console.error("❌ Error en la solicitud:", error);
                Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
            }
        });
    }
    
}

    function agregarUsuario() {
        const btnAgregarUsuario = document.getElementById("agregarUsuario");
        if (btnAgregarUsuario) {
            btnAgregarUsuario.addEventListener("click", async function (event) {
                event.preventDefault();
                console.log("✅ Click en 'Agregar Usuario' detectado.");

                const { value: usuarioData } = await Swal.fire({
                    title: "Agregar Nuevo Usuario",
                    html:
                        `<input id='swal-nombre-usuario' class='swal2-input' placeholder='Nombre de Usuario'>` +
                        `<input id='swal-password-usuario' type='password' class='swal2-input' placeholder='Contraseña'>` +
                        `<select id='swal-rol-usuario' class='swal2-input'>
                            <option value='Administrador'>Administrador</option>
                            <option value='Cajero'>Cajero</option>
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

                if (!usuarioData || !usuarioData.nombre || !usuarioData.password) {
                    Swal.fire("Error", "El nombre y la contraseña son obligatorios", "error");
                    return;
                }

                try {
                    Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                    // Aquí se usa API_USERS
                    const response = await fetch(API_USERS, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(usuarioData)
                    });

                    const data = await response.json();
                    if (response.ok) {
                        Swal.fire("✅ Usuario Agregado", "Se ha registrado correctamente", "success");
                    } else {
                        Swal.fire("❌ Error", data.message || "No se pudo agregar el usuario", "error");
                    }
                } catch (error) {
                    console.error("❌ Error en la solicitud:", error);
                    Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
                }
            });
        }
    }

    // Llama a tus funciones
    mostrarNombreUsuario();
    asignarEventos();
    agregarUsuario(); // <-- Llamas a tu función para asignar el evento al botón
});


async function modificarPuesto() {
    const btnModificarPuesto = document.querySelector(".modify-job");
    if (!btnModificarPuesto) {
      console.error("❌ Botón de modificar puesto no encontrado");
      return;
    }
    btnModificarPuesto.addEventListener("click", async function (event) {
      event.preventDefault();
      try {
        // Obtener todos los puestos de trabajo desde el backend
        const response = await fetch("http://localhost:5000/api/jobs");
        const jobs = await response.json();
  
        if (!Array.isArray(jobs) || jobs.length === 0) {
          Swal.fire("⚠️", "No hay puestos de trabajo registrados.", "warning");
          return;
        }
  
        // Construir las opciones del select en HTML
        let optionsHtml = "";
        jobs.forEach(job => {
          const formattedFichas = job.fichas.toLocaleString("es-ES");
          optionsHtml += `<option value="${job._id}">${job.name} (Fichas: ${formattedFichas})</option>`;
        });
        
  
        // Mostrar SweetAlert con un select y un input para la nueva cantidad
        const { value: formValues } = await Swal.fire({
          title: "Modificar Fichas",
          html: `
            <select id="swal-job-select" class="swal2-input">
              ${optionsHtml}
            </select>
            <input id="swal-input2" type="number" class="swal2-input" placeholder="Nueva cantidad de fichas">
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          preConfirm: () => {
            const selectedJobId = document.getElementById("swal-job-select").value;
            const inputVal = document.getElementById("swal-input2").value;
            // Eliminar puntos para interpretar el número correctamente
            const newFichas = parseInt(inputVal.replace(/\./g, ''), 10);
            if (!selectedJobId) {
              Swal.showValidationMessage("Por favor, selecciona un puesto");
            }
            if (isNaN(newFichas)) {
              Swal.showValidationMessage("Ingresa un número válido para fichas");
            }
            return { selectedJobId, newFichas };
          }
          
        });
  
        if (!formValues) return;
        const { selectedJobId, newFichas } = formValues;
  
        // Enviar la actualización al backend
        const token = localStorage.getItem("token"); // <-- ESTA LÍNEA SOLUCIONA TODO

        const updateResponse = await fetch(`http://localhost:5000/api/jobs/${selectedJobId}/movimiento`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ deltaFichas: newFichas })
        });
        
        const updateData = await updateResponse.json();
        if (updateResponse.ok) {
          Swal.fire("✅ Actualizado", "Cantidad de fichas modificada con éxito", "success");
        } else {
          Swal.fire("❌ Error", updateData.message || "No se pudo modificar la cantidad de fichas", "error");
        }
      } catch (error) {
        console.error("❌ Error:", error);
        Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
      }
    });
  }
  
  document.addEventListener("DOMContentLoaded", modificarPuesto);
  