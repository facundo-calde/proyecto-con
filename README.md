# Proyecto-CON — Sistema de Control de Caja

Aplicación web desarrollada en **Node.js**, **Express** y **MongoDB**, orientada al control y gestión de cajas para plataformas online (por ejemplo, casinos u otros entornos de operación con múltiples usuarios).
El sistema permite administrar billeteras, usuarios, movimientos y resúmenes diarios de forma centralizada y segura.

---

## Características principales

* Autenticación basada en **JWT**
* Gestión de billeteras con saldos dinámicos
* Registro de movimientos positivos y negativos (entradas y salidas)
* Administración de usuarios y roles con control de permisos
* Dashboard con resumen diario por puesto y usuario
* API REST modular y extensible
* Configuración mediante variables de entorno (`.env`)

---

## Estructura del proyecto

```
proyecto-con/
├── backend/
│   ├── controllers/      # Lógica de negocio (billeteras, usuarios, movimientos, etc.)
│   ├── models/           # Esquemas y modelos de Mongoose
│   ├── routes/           # Definición de endpoints REST
│   ├── middlewares/      # Autenticación y validaciones
│   ├── .env              # Variables de entorno (no se versiona)
│   └── server.js         # Punto de entrada principal del backend
│
├── frontend/
│   ├── index.html        # Interfaz principal
│   ├── js/               # Lógica del cliente
│   ├── css/              # Estilos
│   └── assets/           # Recursos estáticos
│
├── .gitignore
├── package.json
└── README.md
```

---

## Instalación local

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/facundo-calde/proyecto-con.git
   cd proyecto-con
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` (basado en `.env.example`) con las siguientes variables mínimas:

   ```
   PORT=5000
   MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>/<db>
   JWT_SECRET=clave_segura
   ```

4. Iniciar el servidor:

   ```bash
   npm start
   ```

   o en modo desarrollo:

   ```bash
   npm run dev
   ```

---

## Endpoints principales

| Método | Ruta               | Descripción              |
| :----- | :----------------- | :----------------------- |
| GET    | `/api/dashboard`   | Resumen general          |
| GET    | `/api/wallets`     | Listar billeteras        |
| POST   | `/api/movimientos` | Registrar movimiento     |
| POST   | `/api/login`       | Autenticación de usuario |
| GET    | `/api/jobs`        | Listar puestos (jobs)    |

---

## Variables de entorno

Archivo `.env` (no se versiona). Ejemplo mínimo:

```
PORT=5000
MONGO_URI=
JWT_SECRET=
```

---

## Tecnologías utilizadas

* Node.js / Express
* MongoDB / Mongoose
* JWT (autenticación)
* CORS
* dotenv
* PM2 (entorno de producción)

---

## Autor

**Facundo Calderón**
Desarrollador Full Stack
Contacto: [calderonquintanapablofacundo@gmail.com](mailto:calderonquintanapablofacundo@gmail.com)

---

## Licencia

Este proyecto se distribuye bajo la licencia **MIT**.
Se permite su uso, copia, modificación y distribución con la debida atribución al autor original.
