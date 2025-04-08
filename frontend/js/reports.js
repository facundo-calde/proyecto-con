// reports.js completo con soporte para mostrar wallet y puesto en depósitos

document.addEventListener("DOMContentLoaded", function () {
    const API_URLS = {
        billeteras: "http://localhost:5000/api/wallets",
        puestos: "http://localhost:5000/api/jobs",
        usuarios: "http://localhost:5000/api/users",
        movimientos: "http://localhost:5000/api/movimientos",
        depositos: "http://localhost:5000/api/depositos",
        propinas: "http://localhost:5000/api/propinas",
        gastos: "http://localhost:5000/api/gastos",
        transferencias: "http://localhost:5000/api/wallets/transferencias",
        recargas: "http://localhost:5000/api/wallets/recargas-administrativas"
    };
    const logoutBtn = document.querySelector(".logout"); // Capturar el botón de cerrar sesión

    const token = localStorage.getItem("token");

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


    async function fetchData(url) {
        try {
            if (!token) throw new Error("Token no encontrado. Debes iniciar sesión.");
            const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            } else {
                throw new Error("Respuesta no es JSON válido.");
            }
        } catch (e) {
            console.error("❌ Error al hacer fetch:", e.message);
            Swal.fire("Error", e.message, "error");
            return [];
        }
    }

    async function cargarBilleteras(conRender = true) {
        try {
            const billeteras = await fetchData(API_URLS.billeteras);
            const lista = document.getElementById("listaBilleteras");
            if (conRender && lista) {
                lista.innerHTML = "";
                billeteras.forEach(b => {
                    let li = document.createElement("li");
                    li.classList.add("billetera-card");
                    li.innerHTML = `<strong>${b.nombre}</strong> - <span>$${b.saldo.toFixed(2)}</span>`;
                    lista.appendChild(li);
                });
            }
            return billeteras;
        } catch (e) {
            console.error("Error al cargar billeteras", e);
            return [];
        }
    }

    async function cargarPuestos() {
        try {
            return await fetchData(API_URLS.puestos);
        } catch (e) {
            console.error("Error al cargar puestos", e);
            return [];
        }
    }

    async function cargarUsuarios() {
        try {
            return await fetchData(API_URLS.usuarios);
        } catch (e) {
            console.error("Error al cargar usuarios", e);
            return [];
        }
    }

    function generarSweetAlertFiltro(titulo, callback) {
        Promise.all([cargarPuestos(), cargarUsuarios(), cargarBilleteras(false)]).then(([puestos, usuarios, billeteras]) => {
            if (!puestos.length || !usuarios.length || !billeteras.length) {
                Swal.fire("Error", "No se pudieron cargar los datos necesarios", "error");
                return;
            }
            const puestosOptions = puestos.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
            const usuariosOptions = usuarios.map(u => `<option value="${u._id}">${u.nombre}</option>`).join('');
            const billeterasOptions = billeteras.map(b => `<option value="${b._id}">${b.nombre}</option>`).join('');

            Swal.fire({
                title: titulo,
                html: `
                    <label>Fecha Inicio: <input type="date" id="start-date"></label><br><br>
                    <label>Fecha Fin: <input type="date" id="end-date"></label><br><br>
                    <label>Usuario: <select id="usuario-filter"><option value="">Todos</option>${usuariosOptions}</select></label><br><br>
                    <label>Puesto: <select id="puesto-filter"><option value="">Todos</option>${puestosOptions}</select></label><br><br>
                    <label>Billetera: <select id="billetera-filter"><option value="">Todas</option>${billeterasOptions}</select></label>
                `,
                showCancelButton: true,
                confirmButtonText: 'Aplicar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const startDate = document.getElementById("start-date").value;
                    const endDate = document.getElementById("end-date").value;
                    const usuarioId = document.getElementById("usuario-filter").value;
                    const puestoId = document.getElementById("puesto-filter").value;
                    const billeteraId = document.getElementById("billetera-filter").value;
                    callback(startDate, endDate, billeteraId, puestoId, usuarioId);
                }
            });
        });
    }

    function renderLista(idLista, datos, formatter) {
        const lista = document.getElementById(idLista);
        lista.innerHTML = "";
        if (!datos.length) {
            lista.innerHTML = "<li>No hay datos disponibles.</li>";
            return;
        }
        datos.forEach(d => {
            const li = document.createElement("li");
            li.classList.add("movimiento-card");
            li.innerHTML = formatter(d);
            lista.appendChild(li);
        });
    }

    async function cargarSeccion(url, listaId, titulo) {
        generarSweetAlertFiltro(titulo, async (start, end, billetera, puesto, usuario) => {
            let query = [];
            if (start) query.push(`startDate=${start}`);
            if (end) query.push(`endDate=${end}`);
            if (billetera) query.push(`billetera=${billetera}`);
            if (puesto && listaId === "listaMovimientos") query.push(`puesto=${puesto}`);
            if (usuario) query.push(`usuario=${usuario}`);
            const finalURL = url + (query.length ? (url.includes("?") ? "&" : "?") + query.join("&") : "");

            const datos = await fetchData(finalURL);
            if (listaId === "listaDepositos") {
                renderLista(listaId, datos, d => `
                  <div><strong>Monto:</strong> ${d.monto}</div>
                  <div><strong>Fecha:</strong> ${new Date(d.fecha).toLocaleDateString()}</div>
                  <div><strong>Usuario:</strong> ${d.usuario?.nombre || 'N/A'}</div>
                  <div><strong>Billetera:</strong> ${d.wallet?.nombre || 'N/A'}</div>
                  <div><strong>Puesto:</strong> ${d.wallet?.caja?.name || 'N/A'}</div>
                `);
              }
               else {
                renderLista(listaId, datos, d => `
                    <div><strong>Monto:</strong> ${d.monto || '-'} </div>
                    <div><strong>Descripción:</strong> ${d.descripcion || '-'} </div>
                    <div><strong>Fecha:</strong> ${new Date(d.fecha).toLocaleDateString()}</div>
                    <div><strong>Usuario:</strong> ${d.usuario?.nombre || 'N/A'}</div>
                    <div><strong>Puesto:</strong> ${d.job?.name || 'N/A'}</div>
                    <div><strong>Billetera:</strong> ${d.wallet?.nombre || 'N/A'}</div>
                    <hr>
                `);
            }
        });
    }

    document.getElementById("filtrosMovimientos").addEventListener("click", () => cargarSeccion(API_URLS.movimientos, "listaMovimientos", "Filtrar Movimientos"));
    document.querySelector(".btnFiltroDepositos").addEventListener("click", () => cargarSeccion(API_URLS.depositos, "listaDepositos", "Filtrar Depósitos"));
    document.querySelector(".btnFiltroPropinas").addEventListener("click", () => cargarSeccion(API_URLS.propinas, "listaPropinas", "Filtrar Propinas"));
    document.querySelector(".btnFiltroGastos").addEventListener("click", () => cargarSeccion(API_URLS.gastos, "listaGastos", "Filtrar Gastos"));
    document.querySelector(".btnFiltroRecargas").addEventListener("click", () => cargarSeccion(API_URLS.recargas, "listaRecargas", "Filtrar Recargas"));

    document.getElementById("btnImprimir").addEventListener("click", function () {
        const contenido = document.getElementById("listaMovimientos").innerHTML;
        const ventana = window.open("", "PRINT", "height=600,width=800");
        ventana.document.write(`
            <html>
                <head>
                    <title>Reporte de Movimientos</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .movimiento-card { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <h1>Reporte de Movimientos</h1>
                    <ul style="list-style: none; padding: 0;">${contenido}</ul>
                </body>
            </html>
        `);
        ventana.document.close();
        ventana.focus();
        ventana.print();
        ventana.close();
    });

    cargarBilleteras();
});







