import { API_ENDPOINTS } from "./config.js";

// reports.js

let token;
document.addEventListener("DOMContentLoaded", function () {
    token = localStorage.getItem("token");

    const API_URLS = {
        billeteras: API_ENDPOINTS.billeteras,
        puestos: API_ENDPOINTS.jobs,
        usuarios: API_ENDPOINTS.users,
        movimientos: API_ENDPOINTS.movimientos,
        depositos: API_ENDPOINTS.depositos,
        propinas: API_ENDPOINTS.propinas,
        gastos: API_ENDPOINTS.gastos,
        transferencias: "API_ENDPOINTS.billeteras/transferencias",
        recargas: "API_ENDPOINTS.billeteras/recargas-administrativas"
    };

    const logoutBtn = document.querySelector(".logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();
            Swal.fire({
                title: "¿Cerrar sesión?",
                text: "Se eliminará la sesión y serás redirigido a la página de inicio.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, salir",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("cajaSeleccionada");
                    window.location.href = "index.html";
                }
            });
        });
    }

    async function fetchData(url) {
        try {
            if (!token) throw new Error("Token no encontrado. Debes iniciar sesión.");
            const response = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
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
        return await fetchData(API_URLS.puestos);
    }

    async function cargarUsuarios() {
        return await fetchData(API_URLS.usuarios);
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
        if (!lista) return;
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

    function generarFiltroMensual(titulo, callback) {
        Swal.fire({
            title: titulo,
            html: `
                <label>Mes: <input type="month" id="mesFiltro"></label>
            `,
            showCancelButton: true,
            confirmButtonText: 'Aplicar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const mesSeleccionado = document.getElementById("mesFiltro").value;
                if (!mesSeleccionado) {
                    Swal.showValidationMessage("Debes seleccionar un mes");
                    return false;
                }
                callback(mesSeleccionado);
            }
        });
    }
    
    async function cargarSeccion(url, listaId, titulo) {
        generarFiltroMensual(titulo, async (mes) => {
            const [anio, mesNum] = mes.split("-");
            const start = `${anio}-${mesNum}-01`;
            const end = new Date(anio, mesNum, 0).toISOString().split("T")[0]; // último día del mes
    
            let query = `?startDate=${start}&endDate=${end}`;
            const finalURL = url + query;
    
            const datos = await fetchData(finalURL);
            const lista = document.getElementById(listaId);
    
            if (!lista) return;
    
            let total = 0;
            datos.forEach(d => {
                total += Number(d.monto || 0);
            });
    
            lista.innerHTML = `<li><strong>Total del mes:</strong> $${total.toFixed(2)}</li>`;
        });
    }
    

    const filtrosMovimientos = document.getElementById("filtrosMovimientos");
    const btnFiltroDepositos = document.querySelector(".btnFiltroDepositos");
    const btnFiltroPropinas = document.querySelector(".btnFiltroPropinas");
    const btnFiltroGastos = document.querySelector(".btnFiltroGastos");
    const btnFiltroRecargas = document.querySelector(".btnFiltroRecargas");
    const btnImprimir = document.getElementById("btnImprimir");

    if (filtrosMovimientos) filtrosMovimientos.addEventListener("click", () => cargarSeccion(API_URLS.movimientos, "listaMovimientos", "Filtrar Movimientos"));
    if (btnFiltroDepositos) btnFiltroDepositos.addEventListener("click", () => cargarSeccion(API_URLS.depositos, "listaDepositos", "Filtrar Depósitos"));
    if (btnFiltroPropinas) btnFiltroPropinas.addEventListener("click", () => cargarSeccion(API_URLS.propinas, "listaPropinas", "Filtrar Propinas"));
    if (btnFiltroGastos) btnFiltroGastos.addEventListener("click", () => cargarSeccion(API_URLS.gastos, "listaGastos", "Filtrar Gastos"));
    if (btnFiltroRecargas) btnFiltroRecargas.addEventListener("click", () => cargarSeccion(API_URLS.recargas, "listaRecargas", "Filtrar Recargas"));

    if (btnImprimir) {
        btnImprimir.addEventListener("click", function () {
            const secciones = [
                { titulo: "Movimientos", id: "listaMovimientos" },
                { titulo: "Depósitos sin reclamar", id: "listaDepositos" },
                { titulo: "Propinas", id: "listaPropinas" },
                { titulo: "Gastos de Oficina", id: "listaGastos" },
            ];
    
            let contenidoTotal = "";
    
            secciones.forEach(sec => {
                const ul = document.getElementById(sec.id);
                const html = ul ? ul.innerHTML : "<li>No hay datos</li>";
                contenidoTotal += `
                    <h2>${sec.titulo}</h2>
                    <ul style="list-style: none; padding: 0;">${html}</ul>
                    <hr>
                `;
            });
    
            const ventana = window.open("", "PRINT", "height=600,width=800");
            ventana.document.write(`
                <html>
                    <head>
                        <title>Reporte General</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h2 { margin-top: 30px; }
                            .movimiento-card { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        </style>
                    </head>
                    <body>
                        <h1>Reporte Mensual</h1>
                        ${contenidoTotal}
                    </body>
                </html>
            `);
            ventana.document.close();
            ventana.focus();
            ventana.print();
            ventana.close();
        });
    }
    

    cargarBilleteras();
});
