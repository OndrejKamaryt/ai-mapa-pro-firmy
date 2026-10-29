#!/usr/bin/env bash
# Složí zdroje ze src/ do index.html (samostatná stránka) a dist/artifact.html (verze pro Claude artefakt).
set -euo pipefail
cd "$(dirname "$0")"
JSPDF='<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>'
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ALL="$TMP/all.js"
cat src/data.js src/font.js src/app.js > "$ALL"
node --check "$ALL"
mkdir -p dist
{
  printf '<!doctype html>\n<html lang="cs">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
  cat src/head.html
  printf '</head>\n<body>\n'
  cat src/body.html
  printf '%s\n<script>\n' "$JSPDF"
  cat "$ALL"
  printf '</script>\n</body>\n</html>\n'
} > index.html
{ cat src/head.html src/body.html; printf '%s\n<script>\n' "$JSPDF"; cat "$ALL"; printf '</script>\n'; } > dist/artifact.html
echo "index.html: $(wc -c < index.html) B, možností: $(grep -c "{ id:'" src/data.js), dlouhých pomlček: $(grep -c '—' index.html || true)"
