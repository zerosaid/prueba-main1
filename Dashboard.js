// =============================
// Configuración de Firebase
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyCeVjR_a-Ws1MhmI6REyshNWk3-GUWK_Q",
  authDomain: "prueba-10764.firebaseapp.com",
  databaseURL: "https://prueba-10764-default-rtdb.firebaseio.com",
  projectId: "prueba-10764",
  storageBucket: "prueba-10764.appspot.com",
  messagingSenderId: "1088604649539",
  appId: "1:1088604649539:web:c3629a654dabc7c8a7cf6f"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// =============================
// Variables globales
// =============================
let usuarioActual = null;
let datosUsuario = null;
let transacciones = [];

// =============================
// Elementos del DOM
// =============================
const nombreUsuarioElem = document.getElementById("nombre-usuario");
const cuentaNumeroElem = document.getElementById("numero-cuenta");
const saldoElem = document.getElementById("saldo");
const fechaCreacionElem = document.getElementById("fecha-creacion");
const cuerpoTabla = document.getElementById("cuerpoTablaTransacciones");
const titularElem = document.getElementById("titular");

// =============================
// Al cargar el HTML
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const nombreUsuario = sessionStorage.getItem("usuario");

  if (!nombreUsuario) {
    alert("Debe iniciar sesión.");
    window.location.href = "1.html";
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const usuario = usuarios.find(u => u.nombre === nombreUsuario);

  if (!usuario) {
    alert("Usuario no encontrado.");
    return;
  }

  datosUsuario = usuario;

  // Generar cuenta si no existe
  if (!datosUsuario.numeroCuenta) {
    datosUsuario.numeroCuenta = generarNumeroCuenta();
    datosUsuario.fechaCreacion = obtenerFechaHoy();

    const index = usuarios.findIndex(u => u.nombre === nombreUsuario);
    usuarios[index] = datosUsuario;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    db.ref('usuarios/' + datosUsuario.cedula + '/numeroCuenta').set(datosUsuario.numeroCuenta);
    db.ref('usuarios/' + datosUsuario.cedula + '/fechaCreacion').set(datosUsuario.fechaCreacion);
  }

  // Obtener datos desde Firebase
  db.ref("usuarios/" + datosUsuario.cedula).once("value").then((snapshot) => {
    if (snapshot.exists()) {
      usuarioActual = snapshot.val();
      mostrarDatosUsuario();
      mostrarResumenTransacciones();
    } else {
      alert("No se encontraron datos del usuario en Firebase.");
    }
  });
});

// =============================
// Función para generar cuenta
// =============================
function generarNumeroCuenta() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function obtenerFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
}

// =============================
// Mostrar datos del usuario
// =============================
function mostrarDatosUsuario() {
  nombreUsuarioElem.textContent = usuarioActual.nombre;
  titularElem.textContent = usuarioActual.nombre;
  cuentaNumeroElem.textContent = usuarioActual.numeroCuenta;
  saldoElem.textContent = "$" + Number(usuarioActual.saldo || 0).toLocaleString();
  fechaCreacionElem.textContent = usuarioActual.fechaCreacion;
}

// =============================
// Mostrar resumen de transacciones
// =============================
function mostrarResumenTransacciones() {
  cuerpoTabla.innerHTML = "";

  if (!usuarioActual.transacciones || usuarioActual.transacciones.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.textContent = "No hay transacciones registradas.";
    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
    return;
  }

  usuarioActual.transacciones.forEach(transaccion => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${transaccion.fecha}</td>
      <td>${transaccion.referencia}</td>
      <td>${transaccion.tipo}</td>
      <td>${transaccion.descripcion}</td>
      <td>$${Number(transaccion.valor).toLocaleString()}</td>
    `;
    cuerpoTabla.appendChild(fila);
  });
}

// =============================
// Cerrar sesión
// =============================
function cerrarSesion() {
  sessionStorage.removeItem("usuario");
  window.location.href = "1.html";
}
