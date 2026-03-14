#!/bin/bash
# uninstall.sh - Removes installed BlurShield extension files

set -e

INSTALL_DIR="${BLURSHIELD_INSTALL_DIR:-$HOME/.local/share/blurshield}"

if [ ! -d "$INSTALL_DIR" ]; then
  echo "Nothing to uninstall. Directory not found: $INSTALL_DIR"
  exit 0
fi

echo "Removing BlurShield from: $INSTALL_DIR"
rm -rf "$INSTALL_DIR"

echo ""
echo "Files removed."
echo ""
echo "To remove from Chrome:"
echo "  1. Open chrome://extensions"
echo "  2. Find 'BlurShield'"
echo "  3. Click 'Remove'"
