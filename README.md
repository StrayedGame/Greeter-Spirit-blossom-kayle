# Kayle Spirit Blossom — Greeter personalizado para LightDM

Tema de inicio de sesión (*greeter*) para **LightDM** con **Web Greeter**, inspirado en la temática *Spirit Blossom* de Kayle (*League of Legends*).

Para personalizar colores, textos, fuentes, animaciones e imagen de fondo, consulta [`INSTRUCCIONES.md`](INSTRUCCIONES.md).

---

## ✅ Requisitos

- **Linux con LightDM** como display manager (`lightdm` instalado y en uso).
- **Web Greeter** (paquete `web-greeter`), que aporta el motor HTML/CSS/JS para los greeters.
- **Python 3** (el instalador lo usa para editar `web-greeter.toml`).
- **Bash** y utilidades básicas (`install`, `sed`, `cp`, `date`).
- **Acceso root** mediante `sudo` (el tema se copia a `/usr/share/web-greeter/themes` y se edita `/etc/lightdm`).
- **Sesión de escritorio funcional** desde la que ejecutar la instalación; el script modifica la pantalla de inicio de sesión.

> El ejemplo usa Arch Linux y `yay`, pero `web-greeter` puede instalarse desde el AUR con cualquier helper (`paru`, `yay`, etc.) o compilarse manualmente en otras distribuciones.

Comprueba que LightDM y Web Greeter están disponibles:

```bash
systemctl status lightdm
web-greeter --version
```

---

## 📦 Instalación del greeter personalizado

### 1. Clona el repositorio

```bash
git clone <URL-del-repositorio> kayle-spirit-blossom-greeter
cd kayle-spirit-blossom-greeter
```

### 2. Instala Web Greeter

En Arch Linux y derivados:

```bash
yay -S web-greeter
```

En otras distribuciones, instala `web-greeter` desde el AUR o desde el código fuente y asegúrate de que exista `/etc/lightdm/web-greeter.toml`.

### 3. Ejecuta el instalador

```bash
sudo ./install.sh
```

¿Que hace el script?:

1. Verifica que se ejecuta como root y que `web-greeter` está instalado.
2. Copia el tema a `/usr/share/web-greeter/themes/kayle-spirit-blossom`.
3. Crea copias de seguridad con fecha de `/etc/lightdm/lightdm.conf` y `/etc/lightdm/web-greeter.toml`.
4. Configura `greeter-session=web-greeter` en `/etc/lightdm/lightdm.conf`.
5. Activa el tema `kayle-spirit-blossom` en `/etc/lightdm/web-greeter.toml`.

### 4. Aplica el cambio

Reinicia LightDM o el equipo:

```bash
sudo systemctl restart lightdm
```

o simplemente reinicia el sistema. En el siguiente inicio de sesión debería aparecer el greeter de Kayle Spirit Blossom.

---

## 🔄 Actualizar el tema

Tras modificar archivos del repositorio, vuelve a copiarlos al sistema con:

```bash
sudo ./install.sh
```

El instalador es idempotente(Se puede aplicar tantas veces como quieras sin romper nada, si la modificacion que hagas no lo rompa en si): reemplaza los archivos del tema y vuelve a fijar la configuración, creando nuevas copias de seguridad.

---

## ↩️ Revertir la instalación

El instalador deja copias de seguridad junto a los archivos originales, por ejemplo:

```
/etc/lightdm/lightdm.conf.before-kayle-spirit-blossom-20260101-120000.bak
/etc/lightdm/web-greeter.toml.before-kayle-spirit-blossom-20260101-120000.bak
```

Restaura las que correspondan y reinicia LightDM:

```bash
sudo cp /etc/lightdm/lightdm.conf.before-kayle-spirit-blossom-*.bak /etc/lightdm/lightdm.conf
sudo cp /etc/lightdm/web-greeter.toml.before-kayle-spirit-blossom-*.bak /etc/lightdm/web-greeter.toml
sudo systemctl restart lightdm
```

---

## 🧪 Probar el tema sin instalarlo

Abre `index.html` en un navegador para revisar estilos y maquetación. Las funciones de login, usuarios y energía requieren `window.lightdm`, así que solo funcionan dentro de LightDM.

---

## 🛠️ Solución de problemas

- **El instalador dice que `web-greeter` no está instalado:** instala el paquete y verifica que el comando `web-greeter` esté en el `PATH`.
- **No aparece `/etc/lightdm/web-greeter.toml`:** reinstala `web-greeter`; el archivo lo proporciona el paquete.
- **La pantalla de login no cambia:** confirma `greeter-session=web-greeter` en `/etc/lightdm/lightdm.conf` y el tema en `/etc/lightdm/web-greeter.toml`, luego reinicia LightDM.
- **La sesión gráfica no arranca tras el cambio:** restaura las copias de seguridad indicadas arriba desde una TTY (`Ctrl+Alt+F2`).
