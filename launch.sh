#!/usr/bin/env bash
# Drift Control Center - Bash launcher for driftwm (Wayland)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
exec electron . --ozone-platform-hint=auto --enable-features=WaylandWindowDecorations "$@"
