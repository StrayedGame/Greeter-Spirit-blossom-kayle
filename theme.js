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
    selected = user;
    for (const button of users.children) {
      button.classList.toggle("active", button.dataset.name === user.name);
    }
    selectedUser.textContent = user.display_name || user.real_name || user.name;
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
    const availableUsers = window.lightdm && Array.isArray(lightdm.users) ? lightdm.users : [];
    for (const user of availableUsers) {
      const button = document.createElement("button");
      button.className = "user";
      button.type = "button";
      button.dataset.name = user.name;
      button.title = user.display_name || user.name;

      const image = document.createElement("img");
      // Si el usuario no tiene avatar configurado, usa un avatar SVG por defecto en tono violeta
      image.src = user.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%25' height='100%25' fill='%237563a5'/%3E%3C/svg%3E";
      image.alt = "";

      button.appendChild(image);
      button.addEventListener("click", () => selectUser(user));
      users.appendChild(button);
    }

    if (availableUsers.length) selectUser(availableUsers[0]);
  }

  /**
   * Muestra la sesión de escritorio seleccionada actualmente (ej. XFCE, GNOME, KDE, i3).
   */
  function updateSession() {
    const sessions = window.lightdm && Array.isArray(lightdm.sessions) ? lightdm.sessions : [];
    if (!sessions.length) return;
    sessionName.textContent = sessions[sessionIndex].name;
  }

  // ==========================================================================
  // CALLBACKS GLOBALES REQUERIDOS POR LA API DE LIGHTDM
  // ==========================================================================

  /**
   * Invocado por LightDM cuando requiere entrada del usuario (ej: solicitud de contraseña).
   */
  window.show_prompt = (text, type) => {
    $("#prompt-label").textContent = text.replace(/:$/, "");
    entry.type = type === "password" ? "password" : "text";
    entry.value = "";
    entry.disabled = false;
    loginButton.disabled = false;

    if (queuedResponse !== null) {
      const response = queuedResponse;
      queuedResponse = null;
      entry.disabled = true;
      loginButton.disabled = true;
      lightdm.respond(response);
      return;
    }

    entry.focus();
  };

  /**
   * Invocado por LightDM para enviar mensajes del sistema.
   */
  window.show_message = (text, type) => setMessage(text, type === "error" ? "error" : "info");

  /**
   * Invocado por LightDM cuando el proceso de autenticación ha completado.
   */
  window.authentication_complete = () => {
    if (lightdm.is_authenticated) {
      setMessage("Abriendo el portal espiritual…", "info");
      document.documentElement.classList.add("session-starting");
      entry.disabled = true;
      loginButton.disabled = true;
      const sessions = lightdm.sessions || [];
      const session = sessions[sessionIndex];
      lightdm.start_session_sync(session ? session.key : undefined);
      return;
    }

    setMessage("No se pudo verificar la identidad. Inténtalo de nuevo.");
    entry.value = "";
    entry.disabled = false;
    loginButton.disabled = false;
    entry.focus();
  };

  // ==========================================================================
  // EVENT LISTENERS DE FORMULARIO Y NAVEGACIÓN
  // ==========================================================================

  // Envío del formulario de inicio de sesión
  $("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    setMessage("");
    if (!window.lightdm) return setMessage("El API de LightDM no está disponible.");

    if (lightdm.in_authentication) {
      lightdm.respond(entry.value);
      return;
    }

    if (!selected) return setMessage("Selecciona un usuario.");
    queuedResponse = entry.value;
    entry.disabled = true;
    loginButton.disabled = true;
    lightdm.authenticate(selected.name);
  });

  // Cambiar entre sesiones de escritorio disponibles al hacer clic
  $("#session-button").addEventListener("click", () => {
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
      if (window.lightdm && lightdm[`can_${method}`]) lightdm[method]();
    });
  }

  powerAction($("#suspend-button"), "suspend");
  powerAction($("#restart-button"), "restart");
  powerAction($("#shutdown-button"), "shutdown");

  // Inicialización
  updateClock();
  setInterval(updateClock, 1000);
  renderUsers();
  updateSession();
})();
