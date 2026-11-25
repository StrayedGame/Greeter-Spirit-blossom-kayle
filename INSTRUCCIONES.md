# Kayle Spirit Blossom — Instrucciones de personalización

Tema de inicio de sesión (*greeter*) para **LightDM** usando **Web Greeter**, inspirado en la temática *Spirit Blossom* (Flor Espiritual) de Kayle (*League of Legends*).

> Para requisitos e instalación, consulta [`README.md`](README.md). Este documento explica cómo editar el tema.

---

## 📁 Estructura del Proyecto

```
kayle-spirit-blossom-greeter/
├── index.html                              # Estructura principal de la interfaz HTML
├── style.css                               # Estilos, colores, fondo, tipografía y animaciones
├── theme.js                                # Lógica de interacción con la API de LightDM (login, usuarios, reloj, energía)
├── index.theme                             # Metadatos de compatibilidad del tema
├── index.toml                              # Punto de entrada para Web Greeter
├── install.sh                              # Script de instalación automática para Linux
├── kayle_splash_centered_78-874414509.jpg  # Imagen de fondo de la tarjeta principal
├── README.md                               # Requisitos e instalación
└── INSTRUCCIONES.md                        # Esta guía de edición y personalización
```

---

## 🛠️ Guía de Edición y Personalización

### 1. Cambiar los Colores (`style.css`)
En las primeras líneas de `style.css` encontrarás las variables de color globales dentro de `:root`. Puedes cambiar estos valores en código hexadecimal (`#HEX`) para adaptar el tema a tus gustos:

```css
:root {
  --ink: #100d2b;    /* Color de fondo oscuro principal */
  --violet: #514080; /* Violeta intermedio */
  --lilac: #b8a0e4;  /* Loto / lila claro para etiquetas y texto secundario */
  --mist: #f5eaff;   /* Blanco místico para texto */
  --gold: #f1d491;   /* Dorado para detalles, resplandores y bordes */
  --rose: #e9a7c8;   /* Rosado para detalles del título */
}
```

### 2. Cambiar la Imagen de Fondo de la Tarjeta (`style.css`)
La imagen del marco principal se configura en la regla `.login-card::before` de `style.css`:

```css
.login-card::before {
  /* Sustituye "kayle_splash_centered_78-874414509.jpg" por la ruta de tu nueva imagen */
  background: url("kayle_splash_centered_78-874414509.jpg") center / cover no-repeat;
}
```
*Tip:* Si usas una imagen nueva, colócala dentro de esta misma carpeta y actualiza el nombre del archivo en `style.css` e `install.sh`.

### 3. Modificar Textos o Títulos (`index.html` y `theme.js`)
- **Título superior:** En `index.html`, dentro de `<div class="brand">`.
- **Subtítulo y Mensaje de Bienvenida:** En `index.html`, dentro de `<p class="eyebrow">` y `<h1>`.
- **Mensajes de estado (errores, inicio de sesión):** En `theme.js` (ej. `"Abriendo el portal espiritual…"` o `"No se pudo verificar la identidad."`).

### 4. Cambiar Fuentes Tipográficas (`style.css`)
Las fuentes se definen en las reglas:
- `body`: Tipografía base (`"Noto Sans", "DejaVu Sans", sans-serif`).
- `h1`: Título principal (`Georgia, serif`).

### 5. Ajustar Animaciones (`style.css`)
- **Pétalos cayendo:** Controlados por la animación `@keyframes drift` y la clase `.petals`.
- **Efecto de respiración de la aurora:** Controlado por `@keyframes breathe` y las clases `.aurora-one` y `.aurora-two`.

### 6. Interfaz y Comportamiento (`index.html` y `theme.js`)
- **Lista de usuarios:** se genera dinámicamente desde `lightdm.users` dentro de `#users`.
- **Selector de sesión:** el botón `#session-button` recorre las sesiones disponibles en `lightdm.sessions`.
- **Acciones de energía:** los botones `#suspend-button`, `#restart-button` y `#shutdown-button` llaman a `lightdm.suspend()`, `lightdm.restart()` y `lightdm.shutdown()`.
- **Reloj:** se actualiza desde `theme.js` en el elemento `#clock`.
- **Mensajes de LightDM:** `show_prompt`, `show_message` y `authentication_complete` se conectan en `theme.js` para mostrar avisos y gestionar el login.

---

## 🖥️ Cómo Probar los Cambios en Tu Navegador

Puedes abrir `index.html` en tu navegador (Chrome, Firefox, etc.) para ajustar colores, tipografía y estilos CSS en tiempo real.

*Nota:* Al abrirlo localmente en un navegador web, las funciones de inicio de sesión y lista de usuarios no mostrarán usuarios reales porque requieren la API de `window.lightdm` que provee el servicio de LightDM en Linux.

---

## 🚀 Aplicar los Cambios

Después de editar los archivos, vuelve a ejecutar el instalador para copiar la versión actualizada al sistema:

```bash
sudo ./install.sh
```

Luego reinicia LightDM o el equipo. Consulta [`README.md`](README.md) para los requisitos y el proceso de instalación completo.
