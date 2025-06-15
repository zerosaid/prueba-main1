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
// Funciones de la aplicación
// =============================
function mostrarOpcion(opcion) {
  ocultarSecciones(); // Oculta todo antes

  switch (opcion) {
    case 'consignacion':
      document.getElementById("consignacionTransacciones")?.classList.remove("oculto");
      consignar();
      break;
    case 'retiro':
      document.getElementById("retiroTransacciones")?.classList.remove("oculto");
      retirar();
      break;
    case 'deposito':
      document.getElementById("depositoTransacciones")?.classList.remove("oculto");
      depositar();
      break;
    case 'reporte':
      document.getElementById("reporteSeccion")?.classList.remove("oculto");
      verReporte();
      break;
    case 'resumen':
      document.getElementById("resumenTransacciones")?.classList.remove("oculto");
      mostrarResumenTransacciones();
      break;
    case 'servicios':
      document.getElementById("serviciosTransacciones")?.classList.remove("oculto");
      pagarServicios();
      break;
    case 'certificado':
      document.getElementById("certificadoSeccion")?.classList.remove("oculto");
      mostrarCertificado();
      break;
    case 'cerrar':
      cerrarSesion();
      break;
    default:
      console.warn("Opción no reconocida:", opcion);
  }
}

// =============================
// Funcion de consignación
// =============================
function consignar() {
  const valor = prompt("Ingrese el valor a consignar:");
  const monto = parseFloat(valor);

  if (isNaN(monto) || monto <= 0) {
    alert("Por favor, ingrese un valor válido.");
    return;
  }

  // Actualizar el saldo
  usuarioActual.saldo = (usuarioActual.saldo || 0) + monto;

  // Crear transacción
  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Consignación",
    descripcion: "Consignación electrónica",
    valor: monto
  };

  // Inicializar array si no existe
  if (!usuarioActual.transacciones) {
    usuarioActual.transacciones = [];
  }

  usuarioActual.transacciones.push(transaccion);

  // Guardar en Firebase
  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  // Actualizar interfaz
  mostrarDatosUsuario();
  mostrarResumenTransacciones();

  // Mostrar visualmente la sección de resumen
  ocultarSecciones();
  document.getElementById("resumenTransacciones").classList.remove("oculto");
}


// =============================
// Funcion de retiro
// =============================

function retirar() {
  const valor = prompt("Ingrese el valor a retirar:");
  const monto = parseFloat(valor);

  if (isNaN(monto) || monto <= 0) {
    alert("Por favor, ingrese un valor válido.");
    return;
  }

  if (usuarioActual.saldo < monto) {
    alert("Saldo insuficiente para realizar el retiro.");
    return;
  }

  // Actualizar el saldo
  usuarioActual.saldo -= monto;

  // Crear transacción
  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Retiro",
    descripcion: "Retiro de efectivo",
    valor: monto
  };

  if (!usuarioActual.transacciones) {
    usuarioActual.transacciones = [];
  }

  usuarioActual.transacciones.push(transaccion);

  // Guardar en Firebase
  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  // Actualizar interfaz
  mostrarDatosUsuario();
  mostrarResumenTransacciones();

  // Mostrar visualmente la sección de resumen
  ocultarSecciones();
  document.getElementById("resumenTransacciones").classList.remove("oculto");
}



// =============================
// Funcion de depósito
// =============================
function depositar() {
  const valor = prompt("Ingrese el valor a depositar:");
  const monto = parseFloat(valor);

  if (isNaN(monto) || monto <= 0) {
    alert("Por favor, ingrese un valor válido.");
    return;
  }

  // Actualizar el saldo
  usuarioActual.saldo += monto;

  // Crear transacción
  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Depósito",
    descripcion: "Depósito en oficina",
    valor: monto
  };

  if (!usuarioActual.transacciones) {
    usuarioActual.transacciones = [];
  }

  usuarioActual.transacciones.push(transaccion);

  // Guardar en Firebase
  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  // Actualizar interfaz
  mostrarDatosUsuario();
  mostrarResumenTransacciones();

  // Mostrar visualmente la sección de resumen
  ocultarSecciones();
  document.getElementById("resumenTransacciones").classList.remove("oculto");
}


// =============================
// Funcion de pago de servicios
// =============================
function pagarServicios() {
  const servicio = prompt("Ingrese el nombre del servicio público (agua, luz, gas, etc):");
  const valor = prompt("Ingrese el valor a pagar:");
  const monto = parseFloat(valor);

  if (!servicio || servicio.trim() === "") {
    alert("Debe ingresar un nombre de servicio.");
    return;
  }

  if (isNaN(monto) || monto <= 0) {
    alert("Por favor, ingrese un valor válido.");
    return;
  }

  if (usuarioActual.saldo < monto) {
    alert("Saldo insuficiente para pagar el servicio.");
    return;
  }

  // Actualizar el saldo
  usuarioActual.saldo -= monto;

  // Crear transacción
  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Pago de servicio",
    descripcion: `Pago de ${servicio}`,
    valor: monto
  };

  if (!usuarioActual.transacciones) {
    usuarioActual.transacciones = [];
  }

  usuarioActual.transacciones.push(transaccion);

  // Guardar en Firebase
  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  // Actualizar interfaz
  mostrarDatosUsuario();
  mostrarResumenTransacciones();

  // Mostrar visualmente la sección de resumen
  ocultarSecciones();
  document.getElementById("resumenTransacciones").classList.remove("oculto");
}


// =============================
// Funcion de reporte
// =============================
function verReporte() {
  // Verificamos si existe la sección de reporte
  const seccionReporte = document.getElementById("seccionReporte");
  if (!seccionReporte) {
    console.warn("No se encontró el contenedor del reporte.");
    return;
  }

  // Llenar campos del reporte con datos del usuario actual
  document.getElementById("reporteNombre").textContent = usuarioActual.nombre || "---";
  document.getElementById("reporteCedula").textContent = usuarioActual.cedula || "---";
  document.getElementById("reporteCuenta").textContent = usuarioActual.numero || "---";
  document.getElementById("reporteFecha").textContent = usuarioActual.fechaCreacion || "---";
  document.getElementById("reporteSaldo").textContent = "$" + Number(usuarioActual.saldo || 0).toLocaleString();

  // Ocultar otras secciones y mostrar esta
  ocultarSecciones();
  seccionReporte.classList.remove("oculto");
}


// =============================
// Funcion de resumen de transacciones
// =============================

function mostrarResumenTransacciones() {
  const cuerpoTabla = document.getElementById("cuerpoTablaTransacciones");
  if (!cuerpoTabla) {
    console.error("No se encontró el cuerpo de la tabla de transacciones.");
    return;
  }

  cuerpoTabla.innerHTML = "";

  const transacciones = usuarioActual.transacciones || [];

  if (transacciones.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.textContent = "No hay transacciones registradas.";
    celda.style.textAlign = "center";
    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
    return;
  }

  transacciones.forEach(transaccion => {
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
// Cerrar sesión
// =============================
function cerrarSesion() {
  sessionStorage.removeItem("usuario");
  window.location.href = "1.html";
}


// =============================
// Funciónes auxiliares
// =============================

function generarReferencia() {
  return "REF" + Math.floor(100000 + Math.random() * 900000);
}

function obtenerFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split('T')[0];
}

function ocultarSecciones() {
  const secciones = document.querySelectorAll(".contenido");
  secciones.forEach(seccion => seccion.classList.add("oculto"));
}
