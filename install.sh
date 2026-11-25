#!/usr/bin/env bash
set -euo pipefail

theme_name="kayle-spirit-blossom"
source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
theme_dir="/usr/share/web-greeter/themes/${theme_name}"
lightdm_config="/etc/lightdm/lightdm.conf"
web_greeter_config="/etc/lightdm/web-greeter.toml"
greeter_session="web-greeter"

if ((EUID != 0)); then
	echo "Ejecuta este instalador con sudo:"
	echo "  sudo $0"
	exit 1
fi

if ! command -v web-greeter >/dev/null 2>&1; then
	echo "web-greeter no está instalado."
	echo "Instálalo primero (por ejemplo, con: yay -S web-greeter)."
	exit 1
fi

if [[ ! -f "$web_greeter_config" ]]; then
	echo "No se encontró $web_greeter_config; reinstala el paquete web-greeter."
	exit 1
fi

install -d -m 0755 "$theme_dir"
install -m 0644 "$source_dir/index.theme" "$source_dir/index.toml" "$source_dir/index.html" "$source_dir/style.css" "$source_dir/theme.js" \
	"$source_dir/kayle_splash_centered_78-874414509.jpg" "$theme_dir/"

backup_suffix=".before-${theme_name}-$(date +%Y%m%d-%H%M%S).bak"
cp --preserve=mode,ownership,timestamps "$lightdm_config" "${lightdm_config}${backup_suffix}"
if [[ -f "$web_greeter_config" ]]; then
	cp --preserve=mode,ownership,timestamps "$web_greeter_config" "${web_greeter_config}${backup_suffix}"
fi

# Declara Web Greeter para todos los asientos.
sed -i \
	-e '/^[[:space:]]*greeter-session[[:space:]]*=/d' \
	-e "/^\[Seat:\*\]$/a greeter-session=${greeter_session}" \
	"$lightdm_config"

python3 - "$web_greeter_config" "$theme_name" <<'PYTHON'
from pathlib import Path
import sys

path = Path(sys.argv[1])
theme = sys.argv[2]
lines = path.read_text().splitlines()
section_start = next((i for i, line in enumerate(lines) if line.strip() == "[greeter]"), None)

if section_start is None:
    lines.extend(["", "[greeter]", f'theme = "{theme}"'])
else:
    section_end = next(
        (i for i in range(section_start + 1, len(lines)) if lines[i].strip().startswith("[")),
        len(lines),
    )
    for i in range(section_start + 1, section_end):
        if lines[i].split("#", 1)[0].strip().replace("-", "_").startswith("theme"):
            lines[i] = f'theme = "{theme}"'
            break
    else:
        lines.insert(section_end, f'theme = "{theme}"')

path.write_text("\n".join(lines) + "\n")
PYTHON

echo "Tema instalado en: $theme_dir"
echo "Se crearon copias de seguridad junto a los archivos de configuración."
echo "Reinicia LightDM o el equipo para iniciar con Web Greeter."
