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
const titularElem = document.getElementById("titular");

// =============================
// Función principal al cargar la página
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

  if (!datosUsuario.numeroCuenta) {
    datosUsuario.numeroCuenta = generarNumeroCuenta();
    datosUsuario.fechaCreacion = obtenerFechaHoy();

    const index = usuarios.findIndex(u => u.nombre === nombreUsuario);
    usuarios[index] = datosUsuario;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    db.ref('usuarios/' + datosUsuario.cedula + '/numeroCuenta').set(datosUsuario.numeroCuenta);
    db.ref('usuarios/' + datosUsuario.cedula + '/fechaCreacion').set(datosUsuario.fechaCreacion);
  }

  db.ref("usuarios/" + datosUsuario.cedula).once("value").then(snapshot => {
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
// Navegación y visualización de secciones
// =============================
let seccionVisible = null;

function mostrarOpcion(opcion) {
  // Excepcionalmente: si la opción es cerrar sesión, ejecutar directamente
  if (opcion === 'cerrar') {
    cerrarSesion();
    seccionVisible = null;
    return;
  }

  const nuevaSeccion = document.getElementById(opcion);
  if (!nuevaSeccion) return;

  const yaVisible = !nuevaSeccion.classList.contains("oculto");

  // Si se vuelve a hacer clic en la misma sección, la ocultamos
  if (seccionVisible === nuevaSeccion && yaVisible) {
    nuevaSeccion.classList.add("oculto");
    seccionVisible = null;
    return;
  }

  // Ocultar todas las secciones con función reutilizable
  ocultarSecciones();

  // Mostrar la nueva sección según la opción
  switch (opcion) {
    case 'consignacion':
      mostrarFormularioConsignacion();
      break;
    case 'retiro':
      retirar();
      break;
    case 'deposito':
      depositar();
      break;
    case 'reporte':
      verReporte();
      break;
    case 'resumen':
      mostrarResumenTransacciones();
      break;
    case 'servicios':
      nuevaSeccion.classList.remove("oculto");
      break;
    case 'certificado':
      mostrarCertificado();
      break;
    default:
      console.warn("Opción no reconocida:", opcion);
      return;
  }
}

function ocultarSecciones() {
  const ids = [
    "consignacion",
    "retiro",
    "deposito",
    "contenido",
    "seccionReporte",
    "servicios",
    "certificado",
    "resumenTransacciones",
    "cerrarSesion"
  ];
  ids.forEach(id => {
    const elem = document.getElementById(id);
    if (elem) elem.classList.add("oculto");
  });
}

// =============================
// Funciones de Consignación
// =============================
function mostrarFormularioConsignacion() {
  document.getElementById("consignacion").classList.remove("oculto");
  document.getElementById("cuentaUsuario").textContent = usuarioActual.numero || "---";
  document.getElementById("nombreUsuario").textContent = usuarioActual.nombre || "---";
}

function realizarConsignacion() {
  const monto = parseFloat(document.getElementById("montoConsignar").value);

  if (isNaN(monto) || monto <= 0) {
    alert("Por favor, ingresa un valor válido mayor que 0.");
    return;
  }

  usuarioActual.saldo = (usuarioActual.saldo || 0) + monto;

  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Consignación",
    descripcion: "Consignación electrónica",
    valor: monto
  };

  usuarioActual.transacciones = usuarioActual.transacciones || [];
  usuarioActual.transacciones.push(transaccion);

  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  document.getElementById("detalleConsignacion").innerHTML = `
    Se consignaron <strong>$${monto.toLocaleString()}</strong> a la cuenta <strong>${usuarioActual.numero}</strong><br>
    Fecha: ${transaccion.fecha} | Ref: ${transaccion.referencia}
  `;
  document.getElementById("resumenConsignacion").classList.remove("oculto");

  mostrarDatosUsuario();
  mostrarResumenTransacciones();
  document.getElementById("montoConsignar").value = "";
}

// =============================
// Funciones de Retiro
// =============================
function retirar() {
  document.getElementById("retiro").classList.remove("oculto");
  document.getElementById("cuentaUsuarioRetiro").textContent = usuarioActual.numeroCuenta || "---";
  document.getElementById("nombreUsuarioRetiro").textContent = usuarioActual.nombre || "---";
}

function realizarRetiro() {
  const monto = parseFloat(document.getElementById("montoRetirar").value);

  if (isNaN(monto) || monto <= 0) {
    alert("Ingrese un monto válido.");
    return;
  }

  if (usuarioActual.saldo < monto) {
    alert("Saldo insuficiente.");
    return;
  }

  usuarioActual.saldo -= monto;

  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Retiro",
    descripcion: "Retiro de efectivo",
    valor: monto
  };

  usuarioActual.transacciones = usuarioActual.transacciones || [];
  usuarioActual.transacciones.push(transaccion);

  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  document.getElementById("detalleRetiro").textContent = `Retiraste $${monto.toLocaleString()} el ${transaccion.fecha} (Ref: ${transaccion.referencia})`;
  document.getElementById("resumenRetiro").classList.remove("oculto");

  mostrarDatosUsuario();
  mostrarResumenTransacciones();
}

// =============================
// Funciones de Depósito
// =============================
function depositar() {
  document.getElementById("deposito").classList.remove("oculto");
  document.getElementById("cuentaUsuarioDeposito").textContent = usuarioActual.numeroCuenta || "---";
  document.getElementById("nombreUsuarioDeposito").textContent = usuarioActual.nombre || "---";
}

function realizarDeposito() {
  const monto = parseFloat(document.getElementById("montoDepositar").value);

  if (isNaN(monto) || monto <= 0) {
    alert("Ingrese un monto válido.");
    return;
  }

  usuarioActual.saldo += monto;

  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Depósito",
    descripcion: "Depósito en oficina",
    valor: monto
  };

  usuarioActual.transacciones = usuarioActual.transacciones || [];
  usuarioActual.transacciones.push(transaccion);

  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  document.getElementById("detalleDeposito").textContent = `Depositaste $${monto.toLocaleString()} el ${transaccion.fecha} (Ref: ${transaccion.referencia})`;
  document.getElementById("resumenDeposito").classList.remove("oculto");

  mostrarDatosUsuario();
  mostrarResumenTransacciones();
}

// =============================
// Funciones de Pago de Servicios
// =============================
function realizarPagoServicio() {
  const tipo = document.getElementById("servicio").value;
  const monto = parseFloat(document.getElementById("valorServicio").value);

  if (isNaN(monto) || monto <= 0) {
    alert("Ingrese un monto válido.");
    return;
  }

  if (monto > usuarioActual.saldo) {
    alert("Saldo insuficiente.");
    return;
  }

  usuarioActual.saldo -= monto;

  const transaccion = {
    fecha: obtenerFechaHoy(),
    referencia: generarReferencia(),
    tipo: "Pago de servicios",
    descripcion: `Pago de ${tipo}`,
    valor: monto
  };

  usuarioActual.transacciones = usuarioActual.transacciones || [];
  usuarioActual.transacciones.push(transaccion);

  db.ref("usuarios/" + usuarioActual.cedula).update({
    saldo: usuarioActual.saldo,
    transacciones: usuarioActual.transacciones
  });

  mostrarDatosUsuario();
  mostrarResumenTransacciones();

  document.getElementById("detallePagoServicio").innerHTML = `
    Servicio: ${tipo}<br>
    Monto: $${monto.toLocaleString()}<br>
    Fecha: ${transaccion.fecha}<br>
    Referencia: ${transaccion.referencia}
  `;
  document.getElementById("resumenPagoServicio").classList.remove("oculto");
  document.getElementById("valorServicio").value = "";
}

// =============================
// Función de Reporte de Cuenta
// =============================
function verReporte() {
  document.getElementById("reporteNombre").textContent = usuarioActual.nombre || "---";
  document.getElementById("reporteCedula").textContent = usuarioActual.cedula || "---";
  document.getElementById("reporteCuenta").textContent = usuarioActual.numero || "---";
  document.getElementById("reporteFecha").textContent = usuarioActual.fechaCreacion || "---";
  document.getElementById("reporteSaldo").textContent = "$" + Number(usuarioActual.saldo || 0).toLocaleString();

  ocultarSecciones();
  document.getElementById("seccionReporte").classList.remove("oculto");
}


// =============================
// Función para mostrar certificado bancario
// =============================
function mostrarCertificado() {
  if (!usuarioActual) {
    alert("No se ha cargado la información del usuario.");
    return;
  }

  // Asignar los valores al certificado
  document.getElementById("titular").textContent = usuarioActual.nombre || "---";
  document.getElementById("certCuenta").textContent = usuarioActual.numeroCuenta || "---";
  document.getElementById("certSaldo").textContent = Number(usuarioActual.saldo || 0).toLocaleString();
  document.getElementById("certFecha").textContent = usuarioActual.fechaCreacion || "---";

  const fechaEmision = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  document.getElementById("certEmision").textContent = fechaEmision;

  // Mostrar la sección del certificado
  ocultarSecciones();
  document.getElementById("certificado").classList.remove("oculto");
}

// =============================
// Mostrar resumen de transacciones
// =============================
function mostrarResumenTransacciones() {
  const tabla = document.getElementById("cuerpoTablaTransacciones");
  const seccion = document.getElementById("resumenTransacciones");

  if (!tabla || !seccion) {
    console.warn("No se encontró el contenedor de transacciones.");
    return;
  }

  // Limpiar tabla antes de insertar filas nuevas
  tabla.innerHTML = "";

  // Verificar si hay transacciones
  if (!usuarioActual.transacciones || usuarioActual.transacciones.length === 0) {
    tabla.innerHTML = `<tr><td colspan="5" style="text-align:center;">Sin movimientos registrados</td></tr>`;
    seccion.classList.remove("oculto");
    return;
  }

  // Insertar cada transacción como fila en la tabla
  usuarioActual.transacciones.forEach(tx => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${tx.fecha}</td>
      <td>${tx.referencia}</td>
      <td>${tx.tipo}</td>
      <td>${tx.descripcion}</td>
      <td>$${Number(tx.valor).toLocaleString()}</td>
    `;
    tabla.appendChild(fila);
  });

  // Mostrar la sección
  ocultarSecciones();
  seccion.classList.remove("oculto");
}


// =============================
// Funciones Auxiliares
// =============================
function generarNumeroCuenta() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function obtenerFechaHoy() {
  return new Date().toISOString().split('T')[0];
}

function mostrarDatosUsuario() {
  nombreUsuarioElem.textContent = usuarioActual.nombre;
  titularElem.textContent = usuarioActual.nombre;
  cuentaNumeroElem.textContent = usuarioActual.numeroCuenta;
  saldoElem.textContent = "$" + Number(usuarioActual.saldo || 0).toLocaleString();
  fechaCreacionElem.textContent = usuarioActual.fechaCreacion;
}

function cerrarSesion() {
  sessionStorage.removeItem("usuario");
  window.location.href = "html1.html";
}

function generarReferencia() {
  return "REF" + Math.floor(100000 + Math.random() * 900000);
}