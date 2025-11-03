import { API_ENDPOINTS } from "./config.js";

// 🔐 TOKEN y ENDPOINTS GLOBALES
const token = localStorage.getItem("token");
const API_URL_BILLETERAS = API_ENDPOINTS.billeteras;
const API_URL_DEPOSITOS = API_ENDPOINTS.depositos;
const API_URL_GASTOS = API_ENDPOINTS.gastos;
const payload = JSON.parse(atob(token.split(".")[1]));
const usuarioId = payload.id;


// Función global para actualizar la cantidad de fichas
async function cargarFichas() {
  const puestoSeleccionado = localStorage.getItem("puestoSeleccionado");
  if (!puestoSeleccionado) {
    console.warn("No se encontró un puesto seleccionado");
    return;
  }
  try {
    const response = await fetch(`${API_ENDPOINTS.jobs}/${puestoSeleccionado}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al obtener el puesto:", errorData);
      return;
    }
    const job = await response.json();
    const cantidadFichas = job.fichas || 0;
    const formattedFichas = cantidadFichas.toLocaleString("es-ES");
    document.getElementById("cantidadFichas").textContent = formattedFichas;
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
}

  // **Obtener la billeteras
  async function cargarBilleteras() {
    const puestoSeleccionado = localStorage.getItem("puestoSeleccionado"); // ID del job
    console.log("📌 Puesto seleccionado al cargar billeteras:", puestoSeleccionado);

    try {
      
      const response = await fetch(API_URL_BILLETERAS, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const billeteras = await response.json();
      listaBilleteras.innerHTML = ""; // Limpiar lista antes de actualizar

      // haz: billetera.caja._id === puestoSeleccionado
      const billeterasFiltradas = billeteras.filter(billetera => {
        return billetera.caja === puestoSeleccionado;
        // o billetera.caja._id === puestoSeleccionado si populaste
      });

      if (billeterasFiltradas.length === 0) {
        listaBilleteras.innerHTML = `<p>No hay billeteras para este puesto.</p>`;
      } else {
        billeterasFiltradas.forEach(billetera => {
          let div = document.createElement("div");
          div.classList.add("billetera-card");

          div.innerHTML = `
                <strong>${billetera.nombre}</strong>
                <span>$${billetera.saldo.toFixed(2)}</span>
              `;
          listaBilleteras.appendChild(div);
        });
      }
    } catch (error) {
      console.error("❌ Error al cargar billeteras:", error);
      listaBilleteras.innerHTML = `<p>Error al cargar billeteras.</p>`;
    }
  }

document.addEventListener("DOMContentLoaded", function () {
  const listaBilleteras = document.getElementById("listaBilleteras");
  const usuarioSpan = document.querySelector(".textWhite strong"); // Capturar el elemento donde va el nombre
  const logoutBtn = document.querySelector(".logout"); // Capturar el botón de cerrar sesión
  

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
  cargarMovimientosDelDia();
});

document.addEventListener("DOMContentLoaded", async function () {
  // Obtener el ID del puesto seleccionado del localStorage
  const puestoSeleccionado = localStorage.getItem("puestoSeleccionado");
  if (!puestoSeleccionado) {
    console.warn("No se encontró un puesto seleccionado");
    return;
  }

  try {
    // Obtener el job por ID
    const response = await fetch(`${API_ENDPOINTS.jobs}/${puestoSeleccionado}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error al obtener el puesto:", errorData);
      return;
    }

    const job = await response.json();
    // Suponiendo que en el modelo se utiliza 'fichas' para la cantidad de fichas
    const cantidadFichas = job.fichas || 0;
    // Formatear el número con separador de miles
    const formattedFichas = cantidadFichas.toLocaleString("es-ES");

    // Actualizar el contenido del elemento
    document.getElementById("cantidadFichas").textContent = formattedFichas;
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
});

// Asumamos que el primer enlace "➕ Agregar" es para depósitos sin reclamar 
const addLinks = document.querySelectorAll("a.add");

addLinks[0].addEventListener("click", async (e) => {
  e.preventDefault();

  const res = await fetch(API_ENDPOINTS.billeteras, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const billeteras = await res.json();
  const billeteraOptions = billeteras.map(b => `<option value="${b._id}">${b.nombre}</option>`).join("");

  const { value: formValues } = await Swal.fire({
    title: "Modificar saldo (positivo o negativo)",
    html: `
      <input type="number" id="swal-deposito-monto" class="swal2-input" placeholder="Monto (ej: 100 o -100)">
      <select id="swal-deposito-billetera" class="swal2-input">
        <option value="">Seleccioná una billetera</option>
        ${billeteraOptions}
      </select>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const monto = parseFloat(document.getElementById("swal-deposito-monto").value);
      const billeteraId = document.getElementById("swal-deposito-billetera").value;

      if (isNaN(monto) || monto === 0) {
        Swal.showValidationMessage("Ingresá un monto distinto de cero");
        return false;
      }
      if (!billeteraId) {
        Swal.showValidationMessage("Seleccioná una billetera");
        return false;
      }

      return { monto, billeteraId };
    }
  });

  if (formValues) {
    const { monto, billeteraId } = formValues;

    const data = {
      monto,
      billeteraId, // ✅ Esto es lo que espera el backend
      fecha: new Date()
    };
    
    
    try {
      const response = await fetch(API_ENDPOINTS.depositos, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire("✅ Éxito", "Movimiento aplicado correctamente", "success");
        await cargarBilleteras(); // actualizar el saldo al instante
      } else {
        Swal.fire("❌ Error", "No se pudo registrar el movimiento", "error");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      Swal.fire("❌ Error", "Error en la solicitud", "error");
    }
  }
});




// --- Gastos de oficina (con billetera seleccionada) ---
addLinks[1].addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    // Obtener billeteras
    const res = await fetch(API_ENDPOINTS.billeteras, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const billeteras = await res.json();

    if (!Array.isArray(billeteras) || billeteras.length === 0) {
      return Swal.fire("⚠️", "No hay billeteras disponibles", "warning");
    }

    // Opciones para el select
    const billeteraOptions = billeteras
      .map(b => `<option value="${b._id}">${b.nombre} (Saldo: $${b.saldo.toFixed(2)})</option>`)
      .join("");

    // Mostrar formulario con selección de billetera
    const { value: formValues } = await Swal.fire({
      title: "Agregar Gasto de Oficina",
      html:
        `<select id="swal-gasto-billetera" class="swal2-input">
           <option value="">Seleccionar billetera</option>
           ${billeteraOptions}
         </select>` +
        `<input type="number" id="swal-gasto-monto" class="swal2-input" placeholder="Monto">` +
        `<input type="text" id="swal-gasto-descripcion" class="swal2-input" placeholder="Descripción">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const walletId = document.getElementById("swal-gasto-billetera").value;
        const inputMonto = document.getElementById("swal-gasto-monto").value;
        const descripcion = document.getElementById("swal-gasto-descripcion").value.trim();
        const monto = parseFloat(inputMonto);

        if (!walletId) {
          Swal.showValidationMessage("Seleccioná una billetera");
          return false;
        }

        if (!monto || monto <= 0) {
          Swal.showValidationMessage("Ingresá un monto válido");
          return false;
        }

        if (!descripcion) {
          Swal.showValidationMessage("Ingresá una descripción");
          return false;
        }

        return { walletId, monto, descripcion };
      }
    });

    if (!formValues) return;

    // Armar el objeto a enviar
    const data = {
      walletId: formValues.walletId,
      monto: formValues.monto,
      descripcion: formValues.descripcion,
      fecha: new Date()
    };

    // Enviar al backend
    const response = await fetch(API_URL_GASTOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      Swal.fire("✅ Gasto registrado", "Se descontó de la billetera elegida", "success");
      await cargarBilleteras();
    } else {
      const errorData = await response.json();
      Swal.fire("❌ Error", errorData.message || "No se pudo guardar", "error");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    Swal.fire("❌ Error", "No se pudo completar la operación", "error");
  }
});


// --- Propinas ---
document.addEventListener("DOMContentLoaded", () => {
  const botonPropinas = document.querySelector(".add-propinas");

  if (!botonPropinas) {
    console.error("❌ No se encontró el botón .add-propinas");
    return;
  }

  botonPropinas.addEventListener("click", async (e) => {
    e.preventDefault();

    const { value: formValues } = await Swal.fire({
      title: "Agregar Propina",
      html: `
        <input type="number" id="swal-propina-monto" class="swal2-input" placeholder="Monto">
        <input type="text" id="swal-propina-descripcion" class="swal2-input" placeholder="Descripción (opcional)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Agregar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const inputMonto = document.getElementById("swal-propina-monto").value;
        const descripcion = document.getElementById("swal-propina-descripcion").value.trim();
        const monto = parseFloat(inputMonto);

        if (!monto || monto <= 0) {
          Swal.showValidationMessage("Ingresa un monto válido");
          return false;
        }

        return { monto, descripcion };
      }
    });

    if (!formValues) return;

    const data = {
      monto: formValues.monto,
      descripcion: formValues.descripcion,
      fecha: new Date()
    };


    try {
      Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const response = await fetch(API_ENDPOINTS.propinas, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire("✅ Éxito", "Propina agregada correctamente", "success");
      } else {
        Swal.fire("❌ Error", "No se pudo agregar la propina", "error");
      }
    } catch (error) {
      console.error("❌ Error al agregar propina:", error);
      Swal.fire("❌ Error", "Error en la solicitud", "error");
    }
  });
});


// Movimiento de fichas (index confirmado = 2)
addLinks[2].addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("🟡 Click en Agregar Movimiento de fichas");
  const jobId = localStorage.getItem("puestoSeleccionado");

  if (!token || !jobId) {
    console.warn("❌ Faltan token o puestoSeleccionado");
    return;
  }

  try {
    const res = await fetch(API_ENDPOINTS.billeteras, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const billeteras = (await res.json()).filter(b => b.caja === jobId);

    if (!billeteras.length) {
      return Swal.fire("Atención", "No hay billeteras disponibles para este puesto", "info");
    }

    const billeteraOptions = billeteras.map(b => `<option value="${b._id}">${b.nombre}</option>`).join("");

    const { value: formValues } = await Swal.fire({
      title: "Agregar Movimiento de Fichas",
      html:
        `<select id="swal-wallet-id" class="swal2-input">${billeteraOptions}</select>` +
        `<input type="number" id="swal-monto" class="swal2-input" placeholder="Monto">` +
        `<input type="text" id="swal-descripcion" class="swal2-input" placeholder="Descripción">`,
      focusConfirm: false,
      preConfirm: () => {
        const walletId = document.getElementById("swal-wallet-id").value;
        const monto = parseFloat(document.getElementById("swal-monto").value);
        const descripcion = document.getElementById("swal-descripcion").value.trim();

        if (!walletId || isNaN(monto)) {
          Swal.showValidationMessage("Seleccioná billetera y monto válido");
        }

        return { walletId, monto, descripcion };
      }
    });

    if (formValues) {
      const data = {
        walletId: formValues.walletId,
        monto: formValues.monto,
        descripcion: formValues.descripcion,
        jobId
      };

      const response = await fetch(API_ENDPOINTS.movimientos, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire("Éxito", "Movimiento registrado correctamente", "success");
        await cargarBilleteras();
        await cargarFichas();
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.error || "Error al guardar", "error");
      }
    }

  } catch (error) {
    console.error("❌ Error al cargar movimiento:", error);
    Swal.fire("Error", "No se pudo abrir el formulario", "error");
  }
});

async function cargarMovimientosDelDia() {
  const hoy = new Date();
  const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
  const fin = new Date(hoy.setHours(23, 59, 59, 999)).toISOString();

  // Obtener el ID del usuario desde el token
  const payload = JSON.parse(atob(token.split(".")[1]));
  const usuarioId = payload.id;

  try {
    const response = await fetch(`${API_ENDPOINTS.movimientos}?startDate=${inicio}&endDate=${fin}&usuario=${usuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const movimientos = await response.json();

    const lista = document.getElementById("movimientosDia");
    if (!lista) {
      console.error("❌ No se encontró el elemento #movimientosDia");
      return;
    }

    lista.innerHTML = "";

    if (!movimientos.length) {
      lista.innerHTML = "<li>No hay movimientos hoy.</li>";
      return;
    }

    movimientos.forEach(m => {
      const li = document.createElement("li");
      li.classList.add("movimiento-card");

      const descripcion = m.descripcion || "Sin descripción";
      const monto = `$${(m.monto || 0).toFixed(2)}`;
      const hora = new Date(m.fecha).toLocaleTimeString();
      const billetera = m.wallet?.nombre || "Billetera desconocida";

      li.innerHTML = `
        <strong>${descripcion}</strong> - ${monto} 
        <br><small>${hora} - <em>${billetera}</em></small>
      `;
      lista.appendChild(li);
    });
  } catch (error) {
    console.error("❌ Error al cargar movimientos del día:", error);
  }
}





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


    if (!token) {
      return Swal.fire("Error", "No se encontró el token. Iniciá sesión nuevamente.", "error");
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.id;

    try {
      Swal.fire({ title: "Validando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const response = await fetch(`${API_ENDPOINTS.users}/${userId}/password`, {
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

//movimiento entre billeteras
document.addEventListener("DOMContentLoaded", () => {
  const botonTransferir = document.querySelector(".add-transferencia");

  if (!botonTransferir) {
    console.error("❌ No se encontró el botón .add-transferencia");
    return;
  }

  botonTransferir.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("✅ Click detectado en ➕ Agregar transferencia");

    try {
      const response = await fetch(API_ENDPOINTS.billeteras, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const wallets = await response.json();

      if (!Array.isArray(wallets) || wallets.length < 2) {
        return Swal.fire("⚠️", "Se necesitan al menos dos billeteras para transferir", "warning");
      }

      const options = wallets
        .map(w => `<option value="${w._id}">${w.nombre} (Saldo: ${w.saldo})</option>`)
        .join("");

      const { value: formValues } = await Swal.fire({
        title: "Transferir entre Billeteras",
        html: `
          <select id="walletOrigen" class="swal2-input">${options}</select>
          <select id="walletDestino" class="swal2-input">${options}</select>
          <input id="monto" type="number" class="swal2-input" placeholder="Monto">
          <input id="detalle" type="text" class="swal2-input" placeholder="Detalle (opcional)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Transferir",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const origen = document.getElementById("walletOrigen").value;
          const destino = document.getElementById("walletDestino").value;
          const monto = parseFloat(document.getElementById("monto").value);
          const detalle = document.getElementById("detalle").value.trim();

          if (!origen || !destino) {
            Swal.showValidationMessage("Seleccioná origen y destino");
            return false;
          }

          if (origen === destino) {
            Swal.showValidationMessage("No podés transferir a la misma billetera");
            return false;
          }

          if (isNaN(monto) || monto <= 0) {
            Swal.showValidationMessage("Ingresá un monto válido");
            return false;
          }

          return { origen, destino, monto, detalle };
        }
      });

      if (!formValues) return;

      Swal.fire({ title: "Procesando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const movResponse = await fetch(`${API_ENDPOINTS.transferencia}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formValues)
      });

      const data = await movResponse.json();

      if (movResponse.ok) {
        Swal.fire("✅ Transferencia realizada", "", "success");
        await cargarBilleteras();
      } else {
        Swal.fire("❌ Error", data.message || "No se pudo realizar la transferencia", "error");
      }

    } catch (err) {
      console.error("❌ Error en la transferencia:", err);
      Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const botonRecarga = document.querySelector(".add-administrativas");

  if (!botonRecarga) {
    console.error("❌ No se encontró el botón .add-administrativas");
    return;
  }

  botonRecarga.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("✅ Click en ➕ Agregar Recarga Administrativa");

    try {

      // Traemos los puestos (jobs)
      const response = await fetch(API_ENDPOINTS.jobs, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const jobs = await response.json();

      if (!Array.isArray(jobs) || jobs.length === 0) {
        return Swal.fire("⚠️", "No hay puestos disponibles", "warning");
      }

      const options = jobs
        .map(j => `<option value="${j._id}">${j.name} (Fichas: ${j.fichas})</option>`)
        .join("");

      const { value: formValues } = await Swal.fire({
        title: "Recarga Administrativa",
        html: `
          <select id="jobDestino" class="swal2-input">${options}</select>
          <input id="monto" type="number" class="swal2-input" placeholder="Monto a cargar (+ o -)">
          <input id="detalle" type="text" class="swal2-input" placeholder="Detalle (obligatorio)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Aplicar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const jobId = document.getElementById("jobDestino").value;
          const monto = parseFloat(document.getElementById("monto").value);
          const detalle = document.getElementById("detalle").value.trim();

          if (!jobId) {
            Swal.showValidationMessage("Seleccioná un puesto");
            return false;
          }

          if (isNaN(monto) || monto === 0) {
            Swal.showValidationMessage("Ingresá un monto válido (positivo o negativo)");
            return false;
          }

          if (!detalle) {
            Swal.showValidationMessage("El detalle es obligatorio");
            return false;
          }

          return { jobId, monto, detalle };
        }
      });

      if (!formValues) return;

      Swal.fire({ title: "Procesando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const recargaResponse = await fetch(`${API_ENDPOINTS.jobs}/recarga-administrativa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formValues)
      });

      const data = await recargaResponse.json();

      if (recargaResponse.ok) {
        Swal.fire("✅ Recarga aplicada", "", "success");
        await cargarFichas();
      } else {
        Swal.fire("❌ Error", data.message || "No se pudo aplicar la recarga", "error");
      }

    } catch (err) {
      console.error("❌ Error en la recarga:", err);
      Swal.fire("❌ Error", "No se pudo conectar con el servidor", "error");
    }
  });
});

