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
                const token = localStorage.getItem("token"); // Obtener el token del localStorage

                const response = await fetch(API_WALLETS, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`  // Aquí se agrega el token a la cabecera
                    },
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
  
  //Cambiar conttraseña
const changePasswordLink = document.querySelector(".changePassword");

if (!changePasswordLink) {
  console.error("🔴 No se encontró el enlace .changePassword");
} else {
  changePasswordLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const { value: formValues } = await Swal.fire({
      title: "Cambiar Contraseña",
      html: `
        <input id="old-password" type="password" class="swal2-input" placeholder="Contraseña actual">
        <input id="new-password" type="password" class="swal2-input" placeholder="Nueva contraseña">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const oldPassword = document.getElementById("old-password").value.trim();
        const newPassword = document.getElementById("new-password").value.trim();

        if (!oldPassword || !newPassword) {
          Swal.showValidationMessage("Ambos campos son obligatorios");
          return false;
        }

        if (newPassword.length < 4) {
          Swal.showValidationMessage("La nueva contraseña debe tener al menos 4 caracteres");
          return false;
        }

        return { oldPassword, newPassword };
      }
    });

    if (!formValues) return;

    const { oldPassword, newPassword } = formValues;
    const token = localStorage.getItem("token");

    if (!token) {
      return Swal.fire("Error", "No se encontró el token. Iniciá sesión nuevamente.", "error");
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id;

    try {
      Swal.fire({ title: "Validando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const response = await fetch(`http://localhost:5000/api/users/${userId}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire("✅ Contraseña actualizada", "", "success");
      } else {
        Swal.fire("❌ Error", data.message || "No se pudo cambiar la contraseña", "error");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
    }
  });
}

//Borra billetera
document.addEventListener("DOMContentLoaded", async function () {
  const botonBorrarWallet = document.querySelector(".deleteWallet");

  if (!botonBorrarWallet) {
    console.error("❌ No se encontró el botón .deleteWallet");
    return;
  }

  botonBorrarWallet.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/wallets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Asegúrate de que el token esté presente
        }
      });

      const wallets = await response.json();

      if (!Array.isArray(wallets) || wallets.length === 0) {
        return Swal.fire("⚠️", "No hay billeteras disponibles para borrar", "warning");
      }

      // Crear opciones para el select
      const options = wallets.map(wallet => `<option value="${wallet._id}">${wallet.nombre} (Saldo: ${wallet.saldo})</option>`).join("");

      // Mostrar SweetAlert con un select para elegir la billetera
      const { value: walletToDelete } = await Swal.fire({
        title: "Seleccionar Billetera para Borrar",
        html: `
          <select id="wallet-select" class="swal2-input">
            ${options}
          </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          return document.getElementById("wallet-select").value;
        }
      });

      if (!walletToDelete) return;

      // Confirmación de borrado
      const confirmDelete = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción eliminará la billetera de manera permanente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
      });

      if (confirmDelete.isConfirmed) {
        // Realizar la solicitud para eliminar la billetera
        const deleteResponse = await fetch(`http://localhost:5000/api/wallets/${walletToDelete}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const deleteData = await deleteResponse.json();

        if (deleteResponse.ok) {
          Swal.fire("✅ Billetera eliminada", "", "success");
        } else {
          Swal.fire("❌ Error", deleteData.message || "No se pudo eliminar la billetera", "error");
        }
      }
    } catch (err) {
      console.error("❌ Error:", err);
      Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
    }
  });
});

//modificar usuario
document.addEventListener("DOMContentLoaded", async function () {
  const botonModificarUsuario = document.querySelector(".modifyUser");

  if (!botonModificarUsuario) {
    console.error("❌ No se encontró el botón .modifyUser");
    return;
  }

  botonModificarUsuario.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      // Obtener los usuarios desde el backend
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const users = await response.json();

      if (!Array.isArray(users) || users.length === 0) {
        return Swal.fire("⚠️", "No hay usuarios para modificar", "warning");
      }

      // Crear opciones para el select
      const options = users.map(user => 
        `<option value="${user._id}" data-estado="${user.estado}">${user.nombre} (${user.rol}) - ${user.estado ? "Activo" : "Inactivo"}</option>`
      ).join("");

      // Mostrar SweetAlert con un select para elegir el usuario a modificar
      const { value: userToModify } = await Swal.fire({
        title: "Seleccionar Usuario para Modificar Estado",
        html: ` 
          <select id="user-select" class="swal2-input">
            ${options}
          </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Modificar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          return document.getElementById("user-select").value;
        }
      });

      if (!userToModify) return;

      // Obtener el estado actual del usuario seleccionado
      const selectedUser = users.find(user => user._id === userToModify);
      const estadoUsuario = selectedUser.estado ? "Inactivo" : "Activo"; // Cambiar según el estado

      // Cambiar el texto del botón dependiendo del estado
      const confirmText = selectedUser.estado ? "Marcar como Inactivo" : "Marcar como Activo";

      // Confirmación de modificación del estado
      const confirmModify = await Swal.fire({
        title: `Cambiar Estado del Usuario: ${selectedUser.nombre}`,
        text: `¿Estás seguro de que quieres cambiar el estado de este usuario a ${estadoUsuario}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "Cancelar"
      });

      if (confirmModify.isConfirmed) {
        // Realizar la solicitud para cambiar el estado del usuario
        const modifyResponse = await fetch(`http://localhost:5000/api/users/${userToModify}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            estado: !selectedUser.estado // Cambiar el estado (si estaba activo lo pone inactivo, y viceversa)
          })
        });

        const modifyData = await modifyResponse.json();

        if (modifyResponse.ok) {
          Swal.fire("✅ Estado modificado", "", "success");
          // Opcional: Actualiza la interfaz si el estado cambia
        } else {
          Swal.fire("❌ Error", modifyData.message || "No se pudo modificar el estado del usuario", "error");
        }
      }
    } catch (err) {
      console.error("❌ Error:", err);
      Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
    }
  });
});


// **Obtener todas las billeteras**
document.addEventListener("DOMContentLoaded", function () {
  const listaBilleteras = document.getElementById("listaBilleteras");

  // **Obtener todas las billeteras
  async function cargarBilleteras() {
      console.log("📌 Cargando todas las billeteras...");

      try {
          const token = localStorage.getItem("token");

          // Verificamos si el token está presente
          if (!token) {
              Swal.fire("Error", "No se encontró el token. Por favor, inicia sesión.", "error");
              return;
          }

          const response = await fetch("http://localhost:5000/api/wallets", {
              headers: {
                  "Authorization": `Bearer ${token}`
              }
          });

          // Verificar que la respuesta fue exitosa
          if (!response.ok) {
              console.error("❌ Error en la respuesta del servidor:", response.status);
              Swal.fire("Error", "No se pudo obtener las billeteras.", "error");
              return;
          }

          const billeteras = await response.json();
          listaBilleteras.innerHTML = ""; // Limpiar lista antes de actualizar

          if (billeteras.length === 0) {
              listaBilleteras.innerHTML = "<li>No hay billeteras registradas.</li>";
          } else {
              billeteras.forEach(billetera => {
                  let li = document.createElement("li");
                  li.classList.add("billetera-card"); // Agrega una clase para estilo si es necesario

                  // Mostrar nombre y saldo de cada billetera
                  li.innerHTML = `
                      <strong>${billetera.nombre}</strong> - 
                      <span>$${billetera.saldo.toFixed(2)}</span>
                  `;
                  listaBilleteras.appendChild(li);
              });
          }
      } catch (error) {
          console.error("❌ Error al cargar billeteras:", error);
          listaBilleteras.innerHTML = "<li>Error al cargar billeteras.</li>";
      }
  }

  // Llamamos a la función al cargar la página
  cargarBilleteras();
});




