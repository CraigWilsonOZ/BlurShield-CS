#!/bin/bash
# install.sh - Copies BlurShield extension files to a local directory for loading in Chrome

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
INSTALL_DIR="${BLURSHIELD_INSTALL_DIR:-$HOME/.local/share/blurshield}"

echo "Installing BlurShield to: $INSTALL_DIR"

mkdir -p "$INSTALL_DIR"

# Copy extension files
cp -r \
  "$PROJECT_DIR/manifest.json" \
  "$PROJECT_DIR/content" \
  "$PROJECT_DIR/patterns" \
  "$PROJECT_DIR/background" \
  "$PROJECT_DIR/popup" \
  "$PROJECT_DIR/options" \
  "$PROJECT_DIR/shared" \
  "$PROJECT_DIR/icons" \
  "$INSTALL_DIR/"

echo ""
echo "Installation complete."
echo ""
echo "To load in Chrome:"
echo "  1. Open chrome://extensions"
echo "  2. Enable 'Developer mode' (top right)"
echo "  3. Click 'Load unpacked'"
echo "  4. Select: $INSTALL_DIR"
