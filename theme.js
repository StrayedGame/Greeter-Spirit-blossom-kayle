(() => {
  "use strict";

  // Función auxiliar para seleccionar elementos del DOM por CSS selector
  const $ = (selector) => document.querySelector(selector);

  // Referencias a elementos clave del DOM
  const entry = $("#entry");
  const message = $("#message");
  const users = $("#users");
  const selectedUser = $("#selected-user");
  const sessionName = $("#session-name");
  const loginButton = $("#login-button");

  // Estado local de la aplicación
  let selected = null;
  let queuedResponse = null;
  let sessionIndex = 0;
  let lightdmReady = false;
  let signalsConnected = false;

  function getLightDM() {
    return window.lightdm && typeof window.lightdm.authenticate === "function"
      ? window.lightdm
      : null;
  }

  function userId(user) {
    return user && (user.username || user.name);
  }

  function initializeLightDM(attempt = 0) {
    const lightdm = getLightDM();
    if (lightdm) {
      lightdmReady = true;
      setMessage("");
      connectLightDMSignals(lightdm);
      renderUsers();
      updateSession();
      if (!selected) setMessage("No hay usuarios disponibles para iniciar sesión.");
      return;
    }

    if (attempt >= 1500) {
      setMessage("El API de LightDM no se pudo cargar.");
      return;
    }

    setTimeout(() => initializeLightDM(attempt + 1), 10);
  }

  /**
   * Muestra un mensaje en la interfaz (errores o información).
   * @param {string} text - Texto del mensaje.
   * @param {string} type - Tipo ("info" para informativo, "" para error/por defecto).
   */
  function setMessage(text, type = "") {
    message.textContent = text || "";
    message.className = `message ${type}`;
  }

  /**
   * Actualiza el reloj de la esquina superior derecha en español.
   */
  function updateClock() {
    $("#clock").textContent = new Intl.DateTimeFormat("es-ES", {
      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
    }).format(new Date());
  }

  /**
   * Selecciona un usuario activo de la lista.
   * @param {Object} user - Objeto de usuario proporcionado por LightDM.
   */
  function selectUser(user) {
    const username = userId(user);
    if (!username) return;

    selected = user;
    for (const button of users.children) {
      button.classList.toggle("active", button.dataset.name === username);
    }
    selectedUser.textContent = user.display_name || user.real_name || username;
    $("#prompt-label").textContent = "Contraseña";
    entry.value = "";
    entry.type = "password";
    queuedResponse = null;
    entry.disabled = false;
    loginButton.disabled = false;
    entry.focus();
  }

  /**
   * Obtiene la lista de usuarios desde la API de LightDM y crea los botones de avatar.
   */
  function renderUsers() {
    const lightdm = getLightDM();
    const availableUsers = lightdm && Array.isArray(lightdm.users) ? lightdm.users : [];
    users.replaceChildren();
    for (const user of availableUsers) {
      const username = userId(user);
      if (!username) continue;

      const button = document.createElement("button");
      button.className = "user";
      button.type = "button";
      button.dataset.name = username;
      button.title = user.display_name || username;

      const image = document.createElement("img");
      // Si el usuario no tiene avatar configurado, usa un avatar SVG por defecto en tono violeta
      image.src = user.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' fill='%237563a5'/%3E%3C/svg%3E";
      image.alt = "";

      button.appendChild(image);
      button.addEventListener("click", () => selectUser(user));
      users.appendChild(button);
    }

    const firstUser = availableUsers.find(userId);
    if (firstUser) selectUser(firstUser);
  }

  /**
   * Muestra la sesión de escritorio seleccionada actualmente (ej. XFCE, GNOME, KDE, i3).
   */
  function updateSession() {
    const lightdm = getLightDM();
    const sessions = lightdm && Array.isArray(lightdm.sessions) ? lightdm.sessions : [];
    if (!sessions.length) return;
    sessionIndex %= sessions.length;
    sessionName.textContent = sessions[sessionIndex].name;
  }

  function startSession(lightdm, session) {
    const sessionKey = session && session.key ? session.key : null;
    if (typeof lightdm.start_session === "function") {
      return lightdm.start_session(sessionKey);
    }
    if (typeof lightdm.start_session_sync === "function") {
      return lightdm.start_session_sync(sessionKey);
    }
    setMessage("El greeter no puede iniciar la sesión seleccionada.");
    return false;
  }

  function handlePrompt(text, type) {
    $("#prompt-label").textContent = String(text || "").replace(/:$/, "");
    entry.type = type === "password" ? "password" : "text";
    entry.value = "";
    entry.disabled = false;
    loginButton.disabled = false;

    if (queuedResponse !== null) {
      const response = queuedResponse;
      queuedResponse = null;
      entry.disabled = true;
      loginButton.disabled = true;
      const lightdm = getLightDM();
      if (lightdm && typeof lightdm.respond === "function") lightdm.respond(response);
      return;
    }

    entry.focus();
  }

  function handleMessage(text, type) {
    setMessage(text, type === "error" ? "error" : "info");
  }

  function handleAuthenticationComplete() {
    const lightdm = getLightDM();
    if (!lightdm) {
      setMessage("El API de LightDM no está disponible.");
      return;
    }

    if (lightdm.is_authenticated) {
      setMessage("Abriendo el portal espiritual…", "info");
      document.documentElement.classList.add("session-starting");
      entry.disabled = true;
      loginButton.disabled = true;
      const sessions = lightdm.sessions || [];
      const session = sessions[sessionIndex] || sessions.find(({ key }) => key === lightdm.default_session);
      if (!session) {
        setMessage("No hay una sesión de escritorio disponible.");
        entry.disabled = false;
        loginButton.disabled = false;
        return;
      }
      startSession(lightdm, session);
      return;
    }

    setMessage("No se pudo verificar la identidad. Inténtalo de nuevo.");
    entry.value = "";
    entry.disabled = false;
    loginButton.disabled = false;
    entry.focus();
  }

  function connectLightDMSignals(lightdm) {
    if (signalsConnected) return;

    const connect = (signal, handler) => {
      if (signal && typeof signal.connect === "function") signal.connect(handler);
    };

    connect(lightdm.show_prompt, handlePrompt);
    connect(lightdm.show_message, handleMessage);
    connect(lightdm.authentication_complete, handleAuthenticationComplete);
    signalsConnected = true;
  }

  // ==========================================================================
  // CALLBACKS GLOBALES REQUERIDOS POR LA API DE LIGHTDM
  // ==========================================================================

  /**
   * Invocado por LightDM cuando requiere entrada del usuario (ej: solicitud de contraseña).
   */
  window.show_prompt = handlePrompt;

  /**
   * Invocado por LightDM para enviar mensajes del sistema.
   */
  window.show_message = handleMessage;

  /**
   * Invocado por LightDM cuando el proceso de autenticación ha completado.
   */
  window.authentication_complete = handleAuthenticationComplete;

  // ==========================================================================
  // EVENT LISTENERS DE FORMULARIO Y NAVEGACIÓN
  // ==========================================================================

  // Envío del formulario de inicio de sesión
  $("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    setMessage("");
    const lightdm = getLightDM();
    if (!lightdm) {
      return setMessage(
        lightdmReady ? "El API de LightDM no está disponible." : "Conectando con LightDM…",
        "info"
      );
    }

    if (lightdm.in_authentication) {
      lightdm.respond(entry.value);
      return;
    }

    if (!selected) return setMessage("Selecciona un usuario.");
    queuedResponse = entry.value;
    entry.disabled = true;
    loginButton.disabled = true;
    lightdm.authenticate(userId(selected));
  });

  // Cambiar entre sesiones de escritorio disponibles al hacer clic
  $("#session-button").addEventListener("click", () => {
    const lightdm = getLightDM();
    if (!lightdm) return;
    const sessions = lightdm.sessions || [];
    if (!sessions.length) return;
    sessionIndex = (sessionIndex + 1) % sessions.length;
    updateSession();
  });

  /**
   * Registra eventos para botones de energía (suspender, reiniciar, apagar).
   */
  function powerAction(button, method) {
    button.addEventListener("click", () => {
      const lightdm = getLightDM();
      if (lightdm && lightdm[`can_${method}`] && typeof lightdm[method] === "function") {
        lightdm[method]();
      }
    });
  }

  powerAction($("#suspend-button"), "suspend");
  powerAction($("#restart-button"), "restart");
  powerAction($("#shutdown-button"), "shutdown");

  // Inicialización
  updateClock();
  setInterval(updateClock, 1000);
  entry.disabled = true;
  loginButton.disabled = true;
  setMessage("Conectando con LightDM…", "info");
  window.addEventListener("GreeterReady", () => initializeLightDM(), { once: true });
  initializeLightDM();
})();
