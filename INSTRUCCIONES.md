# Kayle Spirit Blossom — Tema para LightDM WebKit2

Tema de inicio de sesión (*greeter*) para **LightDM** usando **lightdm-webkit2-greeter**, inspirado en la temática *Spirit Blossom* (Flor Espiritual) de Kayle (*League of Legends*).

---

## 📁 Estructura del Proyecto

```
kayle-spirit-blossom-greeter/
├── index.html                           # Estructura principal de la interfaz HTML
├── style.css                            # Estilos, colores, fondo, tipografía y animaciones
├── theme.js                             # Lógica de interacción con la API de LightDM (login, usuarios, reloj, energía)
├── index.theme                          # Archivo de metadatos del tema para LightDM WebKit
├── install.sh                           # Script de instalación automática para Linux
├── kayle_splash_centered_78-874414509.jpg # Imagen de fondo de la tarjeta principal
└── README.md                            # Guía de documentación y edición
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

---

## 🖥️ Cómo Probar los Cambios en Tu Navegador

Puedes abrir `index.html` en tu navegador (Chrome, Firefox, etc.) para ajustar colores, tipografía y estilos CSS en tiempo real. 

*Nota:* Al abrirlo localmente en un navegador web, las funciones de inicio de sesión y lista de usuarios no mostrarán usuarios reales porque requieren la API de `window.lightdm` que provee el servicio de LightDM en Linux.

---

## 🚀 Instalación y Aplicación

Para instalar o actualizar el tema en tu sistema Linux con `lightdm-webkit2-greeter`:

```bash
sudo ./install.sh
```

El script se encargará de:
1. Copiar los archivos a `/usr/share/lightdm-webkit/themes/kayle-spirit-blossom`.
2. Crear copias de seguridad de las configuraciones existentes en `/etc/lightdm/`.
3. Establecer `kayle-spirit-blossom` como el tema activo.
