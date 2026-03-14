#!/bin/bash
# package.sh - Creates blurshield.zip for distribution

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT="$PROJECT_DIR/blurshield.zip"

cd "$PROJECT_DIR"

# Remove old zip if present
rm -f "$OUTPUT"

# Create zip excluding dev files
zip -r "$OUTPUT" \
  manifest.json \
  content/ \
  patterns/ \
  background/ \
  popup/ \
  options/ \
  shared/ \
  icons/ \
  -x "*.DS_Store"

echo "Created: $OUTPUT"
echo "Size: $(du -h "$OUTPUT" | cut -f1)"
