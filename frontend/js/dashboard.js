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

  // **Obtener la billeteras
  async function cargarBilleteras() {
    const puestoSeleccionado = localStorage.getItem("puestoSeleccionado"); // ID del job
    console.log("📌 Puesto seleccionado al cargar billeteras:", puestoSeleccionado);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API_URL_BILLETERAS, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const billeteras = await response.json();
      listaBilleteras.innerHTML = ""; // Limpiar lista antes de actualizar

      // Filtrar billeteras según el job seleccionado
      // OJO: Si tu endpoint devuelva `billetera.caja` como un objeto (por populate),
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

document.addEventListener("DOMContentLoaded", async function () {
  // Obtener el ID del puesto seleccionado del localStorage
  const puestoSeleccionado = localStorage.getItem("puestoSeleccionado");
  if (!puestoSeleccionado) {
    console.warn("No se encontró un puesto seleccionado");
    return;
  }

  try {
    // Obtener el job por ID
    const response = await fetch(`http://localhost:5000/api/jobs/${puestoSeleccionado}`);
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

// URL de tus endpoints (ajusta según corresponda)
const API_URL_DEPOSITOS = "http://localhost:5000/api/depositos";
const API_URL_GASTOS = "http://localhost:5000/api/gastos";

// Asumamos que el primer enlace "➕ Agregar" es para depósitos sin reclamar 
const addLinks = document.querySelectorAll("a.add");

// --- Depósitos sin reclamar ---
addLinks[0].addEventListener("click", async (e) => {
  e.preventDefault();

  const { value: monto } = await Swal.fire({
    title: "Agregar Depósito sin reclamar",
    html: `<input type="number" id="swal-deposito-monto" class="swal2-input" placeholder="Monto">`,
    focusConfirm: false,
    preConfirm: () => {
      const inputMonto = document.getElementById("swal-deposito-monto").value;
      const monto = parseFloat(inputMonto);
      if (!monto || monto <= 0) {
        Swal.showValidationMessage("Ingresa un monto válido");
      }
      return monto;
    }
  });

  if (monto) {
    // Preparar datos a enviar
    const data = { monto, fecha: new Date() };

    // Obtener token del localStorage
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_URL_DEPOSITOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  // Agregar token aquí
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire("Éxito", "Depósito agregado correctamente", "success");
        // Actualizar interfaz si es necesario
      } else {
        Swal.fire("Error", "No se pudo agregar el depósito", "error");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire("Error", "Error en la solicitud", "error");
    }
  }
});

// --- Gastos de oficina ---
addLinks[1].addEventListener("click", async (e) => {
  e.preventDefault();

  const { value: formValues } = await Swal.fire({
    title: "Agregar Gasto de Oficina",
    html:
      `<input type="number" id="swal-gasto-monto" class="swal2-input" placeholder="Monto">` +
      `<input type="text" id="swal-gasto-descripcion" class="swal2-input" placeholder="Descripción">`,
    focusConfirm: false,
    preConfirm: () => {
      const inputMonto = document.getElementById("swal-gasto-monto").value;
      const descripcion = document.getElementById("swal-gasto-descripcion").value.trim();
      const monto = parseFloat(inputMonto);

      if (!monto || monto <= 0) {
        Swal.showValidationMessage("Ingresa un monto válido");
      }
      if (!descripcion) {
        Swal.showValidationMessage("Ingresa una descripción");
      }
      return { monto, descripcion };
    }
  });

  if (formValues) {
    // Preparar datos a enviar
    const data = {
      monto: formValues.monto,
      descripcion: formValues.descripcion,
      fecha: new Date()
    };

    // Obtener token del localStorage
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_URL_GASTOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Agregar token aquí
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire("Éxito", "Gasto agregado correctamente", "success");
        // Actualizar la interfaz si es necesario
      } else {
        Swal.fire("Error", "No se pudo agregar el gasto", "error");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire("Error", "Error en la solicitud", "error");
    }
  }
});

// --- Propinas ---
addLinks[4].addEventListener("click", async (e) => {
  e.preventDefault();

  const { value: formValues } = await Swal.fire({
    title: "Agregar Propina",
    html:
      `<input type="number" id="swal-propina-monto" class="swal2-input" placeholder="Monto">` +
      `<input type="text" id="swal-propina-descripcion" class="swal2-input" placeholder="Descripción (opcional)">`,
    focusConfirm: false,
    preConfirm: () => {
      const inputMonto = document.getElementById("swal-propina-monto").value;
      const descripcion = document.getElementById("swal-propina-descripcion").value.trim();
      const monto = parseFloat(inputMonto);

      if (!monto || monto <= 0) {
        Swal.showValidationMessage("Ingresa un monto válido");
      }

      return { monto, descripcion };
    }
  });

  if (formValues) {
    const data = {
      monto: formValues.monto,
      descripcion: formValues.descripcion,
      fecha: new Date()
    };

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/propinas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire("Éxito", "Propina agregada correctamente", "success");
      } else {
        Swal.fire("Error", "No se pudo agregar la propina", "error");
      }
    } catch (error) {
      console.error("Error al agregar propina:", error);
      Swal.fire("Error", "Error en la solicitud", "error");
    }
  }
});

// Movimiento de fichas (index confirmado = 2)
addLinks[2].addEventListener("click", async (e) => {
  e.preventDefault();
  console.log("🟡 Click en Agregar Movimiento de fichas");

  const token = localStorage.getItem("token");
  const jobId = localStorage.getItem("puestoSeleccionado");

  if (!token || !jobId) {
    console.warn("❌ Faltan token o puestoSeleccionado");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/wallets", {
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

      const response = await fetch("http://localhost:5000/api/movimientos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        Swal.fire("Éxito", "Movimiento registrado correctamente", "success");
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
