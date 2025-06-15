// =========================
// Firebase Configuración
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========================
// Variables globales
// =========================
let transacciones = [];
let contadorOperaciones = 0;
let cuenta = {};
let cedulaUsuario = sessionStorage.getItem("cedula");

// =========================
// Menú hamburguesa
// =========================
const toggleBtn = document.getElementById('hamburguesa');
const menu = document.getElementById('menu');
toggleBtn.addEventListener('click', () => menu.classList.toggle('mostrar'));

// =========================
// Capitalizar nombres
// =========================
function capitalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .split(" ")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// =========================
// Cargar usuario desde Firebase
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  if (!cedulaUsuario) {
    window.location.href = "html1.html";
    return;
  }

  try {
    const snapshot = await get(ref(db, 'usuarios/' + cedulaUsuario));
    if (!snapshot.exists()) {
      alert("Usuario no encontrado en la base de datos.");
      window.location.href = "html1.html";
      return;
    }

    const datos = snapshot.val();
    cuenta = {
      numero: datos.numero || "0000000000",
      saldo: datos.saldo || 0,
      fechaCreacion: datos.fechaCreacion || new Date().toLocaleDateString()
    };
    transacciones = datos.transacciones || [];

    document.getElementById("cuenta").textContent = cuenta.numero;
    document.getElementById("saldo").textContent = cuenta.saldo.toLocaleString();
    document.getElementById("fecha").textContent = cuenta.fechaCreacion;
    document.getElementById("nombreUsuario").textContent = capitalizarNombre(datos.nombre);

  } catch (error) {
    console.error("Error cargando datos del usuario:", error);
  }
});

// =========================
// Actualizar datos en Firebase
// =========================
function guardarCambios() {
  update(ref(db, 'usuarios/' + cedulaUsuario), {
    saldo: cuenta.saldo,
    transacciones: transacciones.slice(0, 10)
  });
}

function actualizarSaldo() {
  document.getElementById("saldo").textContent = cuenta.saldo.toLocaleString();
  guardarCambios();
}

function generarReferencia() {
  return "REF" + Math.floor(100000 + Math.random() * 900000);
}

function registrarTransaccion(fecha, referencia, tipo, descripcion, valor) {
  transacciones.unshift({ fecha, referencia, tipo, descripcion, valor });
  if (transacciones.length > 10) transacciones.pop();
}

function verificarCargoPorUso() {
  contadorOperaciones++;
  if (contadorOperaciones % 5 === 0) {
    const valorCargo = 1200;
    if (cuenta.saldo >= valorCargo) {
      cuenta.saldo -= valorCargo;
      actualizarSaldo();
      const fecha = new Date().toLocaleString();
      const referencia = generarReferencia();
      registrarTransaccion(fecha, referencia, "Cargo", "Cargo por uso del sistema", valorCargo);
      alert("Se aplicó un cargo automático de $1.200 por uso del sistema.");
    } else {
      alert("No se pudo aplicar el cargo por uso del sistema: saldo insuficiente.");
    }
  }
}

function mostrarResumenTransacciones() {
  const cuerpo = document.getElementById("cuerpoTablaTransacciones");
  cuerpo.innerHTML = "";
  if (transacciones.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="5">No hay transacciones registradas.</td></tr>`;
    return;
  }
  transacciones.forEach(tx => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${tx.fecha}</td>
      <td>${tx.referencia}</td>
      <td>${tx.tipo}</td>
      <td>${tx.descripcion}</td>
      <td>$${tx.valor.toLocaleString()}</td>`;
    cuerpo.appendChild(fila);
  });
}

// =========================
// Autenticación
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const usuario = sessionStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "html1.html";
  } else {
    const nombreElemento = document.getElementById("nombreUsuario");
    if (nombreElemento) nombreElemento.textContent = usuario;
  }
});

window.onload = () => {
  document.getElementById("cuenta").textContent = cuenta.numero;
  document.getElementById("saldo").textContent = cuenta.saldo.toLocaleString();
  document.getElementById("fecha").textContent = cuenta.fechaCreacion;
};

// =========================
// Navegación de opciones
// =========================
function mostrarOpcion(opcion) {
  const secciones = document.querySelectorAll(".contenido");
  secciones.forEach((seccion) => (seccion.style.display = "none"));

  const contenedor = document.getElementById("contenido");
  if (contenedor) {
    contenedor.style.display = "none";
    contenedor.innerHTML = "";
  }

  switch (opcion) {
    case "consignacion":
      document.getElementById("consignacion").style.display = "block";
      break;
    case "retiro":
      document.getElementById("retiro").style.display = "block";
      break;
    case "resumen":
      document.getElementById("resumenTransacciones").style.display = "block";
      mostrarResumenTransacciones();
      break;
    case "reporte":
      document.getElementById("reporte").style.display = "block";
      document.getElementById("reporteCuenta").textContent = cuenta.numero;
      document.getElementById("reporteSaldo").textContent = cuenta.saldo.toLocaleString();
      document.getElementById("reporteFecha").textContent = cuenta.fechaCreacion;
      break;
    case "deposito":
      if (contenedor) {
        contenedor.style.display = "block";
        contenedor.innerHTML = `
          <h2>Depósito de Dinero</h2>
          <label for="deposito">Cantidad a depositar:</label>
          <input type="number" id="deposito" min="1" required>
          <br><br>
          <button onclick="realizarDeposito()">Confirmar depósito</button>
        `;
      }
      break;
    case "servicios":
      document.getElementById("servicios").style.display = "block";
      break;
    case "certificado":
      document.getElementById("certificado").style.display = "block";
      document.getElementById("certCuenta").textContent = cuenta.numero;
      document.getElementById("certSaldo").textContent = cuenta.saldo.toLocaleString();
      document.getElementById("certFecha").textContent = cuenta.fechaCreacion;
      document.getElementById("certEmision").textContent = new Date().toLocaleString();
      break;
    case "cerrar":
      transacciones.length = 0;
      sessionStorage.removeItem("usuario");
      window.location.href = "html1.html";
      break;
    default:
      alert("Opción no válida.");
  }
}
