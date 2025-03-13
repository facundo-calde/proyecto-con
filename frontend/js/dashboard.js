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
          const response = await fetch(API_URL_BILLETERAS);
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
  


