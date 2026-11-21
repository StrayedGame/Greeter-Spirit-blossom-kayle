#!/usr/bin/env bash
set -euo pipefail

theme_name="kayle-spirit-blossom"
source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
theme_dir="/usr/share/lightdm-webkit/themes/${theme_name}"
lightdm_config="/etc/lightdm/lightdm.conf"
webkit_config="/etc/lightdm/lightdm-webkit2-greeter.conf"
greeter_session="lightdm-webkit2-greeter"

if ((EUID != 0)); then
	echo "Ejecuta este instalador con sudo:"
	echo "  sudo $0"
	exit 1
fi

install -d -m 0755 "$theme_dir"
install -m 0644 "$source_dir/index.theme" "$source_dir/index.html" "$source_dir/style.css" "$source_dir/theme.js" \
	"$source_dir/kayle_splash_centered_78-874414509.jpg" "$theme_dir/"

backup_suffix=".before-${theme_name}-$(date +%Y%m%d-%H%M%S).bak"
cp --preserve=mode,ownership,timestamps "$lightdm_config" "${lightdm_config}${backup_suffix}"
cp --preserve=mode,ownership,timestamps "$webkit_config" "${webkit_config}${backup_suffix}"

# Elimina las entradas activas duplicadas y declara el greeter WebKit2 para todos los asientos.
sed -i \
	-e '/^[[:space:]]*greeter-session[[:space:]]*=/d' \
	-e "/^\[Seat:\*\]$/a greeter-session=${greeter_session}" \
	"$lightdm_config"

if grep -q '^[[:space:]]*webkit_theme[[:space:]]*=' "$webkit_config"; then
	sed -i 's|^[[:space:]]*webkit_theme[[:space:]]*=.*|webkit_theme = kayle-spirit-blossom|' "$webkit_config"
else
	sed -i '/^\[greeter\]$/a webkit_theme = kayle-spirit-blossom' "$webkit_config"
fi

echo "Tema instalado en: $theme_dir"
echo "Se crearon copias de seguridad junto a los archivos de configuración."
echo "Reinicia el equipo para iniciar LightDM con el nuevo tema."
