#!/usr/bin/env fish
# Drift Control Center - Fish launcher for driftwm (Wayland)
set -l script_dir (status dirname)
cd $script_dir
exec electron . --ozone-platform-hint=auto --enable-features=WaylandWindowDecorations $argv
