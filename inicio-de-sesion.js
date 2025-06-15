// =============================
// Configuración de Firebase
// =============================
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

// =============================
// Inicialización DOM
// =============================
document.addEventListener('DOMContentLoaded', () => {
  const btnAbrirLogin = document.getElementById('btn-iniciar-sesion');
  const ventanaLogin = document.getElementById('window');
  const btnCerrarLogin = document.getElementById('btn-cerrar');
  const btnConfirmarLogin = document.getElementById('btn-confirmar');
  const mensajeLogin = document.getElementById('mensaje-login');
  const linkRegistrarDesdeLogin = document.getElementById('link-a-registrar');
  const inputUsuario = document.getElementById('usuario');
  const inputTipo = document.getElementById('tipo');
  const inputCedula = document.getElementById('cedula');
  const inputContraseña = document.getElementById('contraseña');

  const ventanaRegis = document.getElementById('window-regis');
  const btnAbrirRegis = document.getElementById('btn-registrarse');
  const btnCerrarRegistro = document.getElementById('btn-cerrar-registro');
  const btnRegistrar = document.getElementById('registrarse');

  const passwordInputRegis = document.getElementById('contraseña-regis');
  const toggleButtonRegis = document.getElementById('toggle-password-regis');

  // =============================
  // Eventos
  // =============================
  btnAbrirLogin.addEventListener('click', () => {
    ventanaLogin.style.display = 'block';
    mensajeLogin.textContent = '';
  });

  btnCerrarLogin.addEventListener('click', () => {
    ventanaLogin.style.display = 'none';
    limpiarCamposLogin();
  });

  linkRegistrarDesdeLogin.addEventListener('click', (e) => {
    e.preventDefault();
    ventanaLogin.style.display = 'none';
    ventanaRegis.style.display = 'block';
  });

  btnConfirmarLogin.addEventListener('click', () => {
    const usuario = inputUsuario.value.trim();
    const tipo = inputTipo.value;
    const cedula = inputCedula.value.trim();
    const contraseña = inputContraseña.value;

    if (!usuario || !tipo || !cedula || !contraseña) {
      mensajeLogin.style.color = "red";
      mensajeLogin.textContent = "Por favor complete todos los campos.";
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const encontrado = usuarios.find(u =>
      u.nombre === usuario &&
      u.tipo === tipo &&
      u.cedula === cedula &&
      u.contraseña === contraseña
    );

    if (encontrado) {
      mensajeLogin.style.color = "green";
      mensajeLogin.textContent = "Inicio de sesión exitoso.";
      sessionStorage.setItem("usuario", usuario);
      setTimeout(() => {
        ventanaLogin.style.display = 'none';
        window.location.href = 'html.html';
      }, 1000);
    } else {
      mensajeLogin.style.color = "red";
      mensajeLogin.textContent = "Credenciales incorrectas.";
    }
  });

  btnAbrirRegis.addEventListener('click', () => {
    ventanaRegis.style.display = 'block';
  });

  btnCerrarRegistro.addEventListener('click', () => {
    ventanaRegis.style.display = 'none';
    limpiarCamposRegistro();
  });

  btnRegistrar.addEventListener('click', () => {
    const nuevoUsuario = {
      tipo: document.getElementById('tipo-regis').value,
      cedula: document.getElementById('cedula-regis').value.trim(),
      nombre: document.getElementById('usuario-regis').value.trim(),
      genero: document.getElementById('genero-regis').value,
      telefono: document.getElementById('telefono-regis').value.trim(),
      correo: document.getElementById('correo-regis').value.trim(),
      direccion: document.getElementById('direccion-regis').value.trim(),
      ciudad: document.getElementById('ciudad-regis').value.trim(),
      contraseña: document.getElementById('contraseña-regis').value
    };

    const correoValido = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/;
    if (!correoValido.test(nuevoUsuario.correo)) {
      alert("Solo se permiten correos @gmail.com o @hotmail.com.");
      return;
    }

    if (!nuevoUsuario.tipo || !nuevoUsuario.cedula || !nuevoUsuario.nombre || !nuevoUsuario.contraseña) {
      alert("Por favor complete todos los campos requeridos.");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    firebase.database().ref('usuarios/' + nuevoUsuario.cedula).set(nuevoUsuario)
      .then(() => {
        alert("Registro exitoso.");
        ventanaRegis.style.display = 'none';
        limpiarCamposRegistro();
      })
      .catch((error) => {
        alert("Error al registrar en Firebase: " + error.message);
      });
  });

  function limpiarCamposLogin() {
    inputUsuario.value = '';
    inputTipo.selectedIndex = 0;
    inputCedula.value = '';
    inputContraseña.value = '';
    mensajeLogin.textContent = '';
  }

  function limpiarCamposRegistro() {
    document.getElementById('tipo-regis').selectedIndex = 0;
    document.getElementById('cedula-regis').value = '';
    document.getElementById('usuario-regis').value = '';
    document.getElementById('genero-regis').selectedIndex = 0;
    document.getElementById('telefono-regis').value = '';
    document.getElementById('correo-regis').value = '';
    document.getElementById('direccion-regis').value = '';
    document.getElementById('ciudad-regis').value = '';
    document.getElementById('contraseña-regis').value = '';
  }
});

  // ======================
  // Elementos Login
  // ======================
  const btnAbrirLogin = document.getElementById('btn-iniciar-sesion');
  const ventanaLogin = document.getElementById('window');
  const btnCerrarLogin = document.getElementById('btn-cerrar');
  const btnConfirmarLogin = document.getElementById('btn-confirmar');
  const mensajeLogin = document.getElementById('mensaje-login');
  const linkRegistrarDesdeLogin = document.getElementById('link-a-registrar');

  const inputUsuario = document.getElementById('usuario');
  const inputTipo = document.getElementById('tipo');
  const inputCedula = document.getElementById('cedula');
  const inputContraseña = document.getElementById('contraseña');

  // ======================
  // Elementos Registro
  // ======================
  const ventanaRegis = document.getElementById('window-regis');
  const btnAbrirRegis = document.getElementById('btn-registrarse');
  const btnCerrarRegistro = document.getElementById('btn-cerrar-registro');
  const btnRegistrar = document.getElementById('registrarse');

  // === Contraseña toggle ===
  const passwordInputLogin = document.getElementById('contraseña-login');
  const toggleButtonLogin = document.getElementById('toggle-password-login');
  const passwordInputRegis = document.getElementById('contraseña-regis');
  const toggleButtonRegis = document.getElementById('toggle-password-regis');

  // === Secciones de la interfaz ===
  const seccionInicio = document.getElementById('inicio');
  const seccionDashboard = document.getElementById('dashboard');

  // ======================
  // Eventos Login
  // ======================
  btnAbrirLogin.addEventListener('click', () => {
    ventanaLogin.style.display = 'block';
    mensajeLogin.textContent = '';
  });

  btnCerrarLogin.addEventListener('click', () => {
    ventanaLogin.style.display = 'none';
    limpiarCamposLogin();
  });

  linkRegistrarDesdeLogin.addEventListener('click', (e) => {
    e.preventDefault();
    ventanaLogin.style.display = 'none';
    ventanaRegis.style.display = 'block';
  });

  btnConfirmarLogin.addEventListener('click', () => {
    const usuario = inputUsuario.value.trim();
    const tipo = inputTipo.value;
    const cedula = inputCedula.value.trim();
    const contraseña = inputContraseña.value;

    if (!usuario || !tipo || !cedula || !contraseña) {
      mensajeLogin.style.color = "red";
      mensajeLogin.textContent = "Por favor complete todos los campos.";
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const encontrado = usuarios.find(u =>
      u.nombre === usuario &&
      u.tipo === tipo &&
      u.cedula === cedula &&
      u.contraseña === contraseña
    );

    const frases = [
      "Temporada de patos... ¿otra vez? ¡No! Es temporada de ganancias explosivas en ACME Bank.",
      "¡Dinero va! Como en los Looney Tunes, pero aquí sí puedes atraparlo.",
      "Tus ahorros, más seguros que el Coyote comprando en ACME.",
      "¡Boom! Tus finanzas despegan con más fuerza que una dinamita de dibujos animados.",
      "Temporada de errores financieros... cancelada. ¡Bienvenido a ACME Bank!",
      "Saltando más alto que Bugs Bunny… así sube tu saldo aquí.",
      "¿Temporada de caos? No. Aquí solo temporada de control total de tu dinero.",
      "Más confiable que cualquier invento del Coyote. Así es ACME Bank.",
      "No necesitas una caja ACME, solo tu cuenta para lograrlo todo.",
      "Tus finanzas corren tan rápido como el Correcaminos… ¡pero aquí no se escapan!",
      "¿Temporada de pobreza? ¡Jamás! Aquí es temporada de progreso.",
      "Más giros que el Taz… pero con cada vuelta, crece tu saldo.",
      "Una cuenta tan fuerte como el martillo de Marvin el Marciano.",
      "Aquí no caes en trampas del Coyote: cada clic te hace avanzar.",
      "¡Es temporada de inversión! Y tus ganancias no conocen gravedad."
    ];

    const pFrase = document.getElementById("frase-temporada");
    if (pFrase) {
      const aleatoria = frases[Math.floor(Math.random() * frases.length)];
      pFrase.textContent = aleatoria;
    }

    if (encontrado) {
      mensajeLogin.style.color = "green";
      mensajeLogin.textContent = "Inicio de sesión exitoso.";
      sessionStorage.setItem("usuario", usuario);
      setTimeout(() => {
        ventanaLogin.style.display = 'none';
        window.location.href = 'html.html';
      }, 1000);
    } else {
      mensajeLogin.style.color = "red";
      mensajeLogin.textContent = "Credenciales incorrectas. Intente nuevamente.";
    }
  });

  // ======================
  // Eventos Registro
  // ======================
  btnAbrirRegis.addEventListener('click', () => {
    ventanaRegis.style.display = 'block';
  });

  btnCerrarRegistro.addEventListener('click', () => {
    ventanaRegis.style.display = 'none';
    limpiarCamposRegistro();
  });

  btnRegistrar.addEventListener('click', () => {
    const nuevoUsuario = {
      tipo: document.getElementById('tipo-regis').value,
      cedula: document.getElementById('cedula-regis').value.trim(),
      nombre: document.getElementById('usuario-regis').value.trim(),
      genero: document.getElementById('genero-regis').value,
      telefono: document.getElementById('telefono-regis').value.trim(),
      correo: document.getElementById('correo-regis').value.trim(),
      direccion: document.getElementById('direccion-regis').value.trim(),
      ciudad: document.getElementById('ciudad-regis').value.trim(),
      contraseña: document.getElementById('contraseña-regis').value
    };

    // ✅ Validación de correo electrónico
    const correoValido = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/;
    if (!correoValido.test(nuevoUsuario.correo)) {
      alert("Solo se permiten correos @gmail.com o @hotmail.com.");
      return;
    }
  
    if (!nuevoUsuario.tipo || !nuevoUsuario.cedula || !nuevoUsuario.nombre || !nuevoUsuario.contraseña) {
      alert("Por favor complete todos los campos requeridos.");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert("Registro exitoso.");
    ventanaRegis.style.display = 'none';
    limpiarCamposRegistro();
  });

  // === Mostrar/Ocultar contraseña ===
  toggleButtonLogin.addEventListener('click', () => {
    const isPassword = passwordInputLogin.type === 'password';
    passwordInputLogin.type = isPassword ? 'text' : 'password';
    toggleButtonLogin.textContent = isPassword ? '🙈' : '👁️';
  });

  toggleButtonRegis.addEventListener('click', () => {
    const isPassword = passwordInputRegis.type === 'password';
    passwordInputRegis.type = isPassword ? 'text' : 'password';
    toggleButtonRegis.textContent = isPassword ? '🙈' : '👁️';
  });

  // ======================
  // Funciones Auxiliares
  // ======================
  function limpiarCamposLogin() {
    inputUsuario.value = '';
    inputTipo.selectedIndex = 0;
    inputCedula.value = '';
    inputContraseña.value = '';
    mensajeLogin.textContent = '';
  }

  function limpiarCamposRegistro() {
    document.getElementById('tipo-regis').selectedIndex = 0;
    document.getElementById('cedula-regis').value = '';
    document.getElementById('usuario-regis').value = '';
    document.getElementById('genero-regis').selectedIndex = 0;
    document.getElementById('telefono-regis').value = '';
    document.getElementById('correo-regis').value = '';
    document.getElementById('direccion-regis').value = '';
    document.getElementById('ciudad-regis').value = '';
    document.getElementById('contraseña-regis').value = '';
  }

    // === Cerrar sesión desde el botón del menú ===
    const btnCerrarSesion = document.querySelector("button[onclick*='cerrar']");
    if (btnCerrarSesion) {
      btnCerrarSesion.addEventListener("click", () => {
        sessionStorage.removeItem("usuario");
        seccionDashboard.classList.add("oculto");
        seccionInicio.classList.remove("oculto");
      });
    }
  });
  
  // === Verificar sesión activa al cargar la página ===
  const usuarioSesion = sessionStorage.getItem("usuario");
  if (usuarioSesion) {
    document.getElementById("inicio").classList.add("oculto");
    document.getElementById("dashboard").classList.remove("oculto");
  }

  function togglePassword(idCampo, boton) {
    const campo = document.getElementById(idCampo);
    const esPassword = campo.type === "password";
    campo.type = esPassword ? "text" : "password";
    boton.textContent = esPassword ? "🙈" : "👁️";
  }
  
  