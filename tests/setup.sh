#!/usr/bin/env bash
# Stáhne jsPDF 2.5.1 z npm, aby testy běžely bez přístupu na CDN.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p vendor
cd vendor
npm pack jspdf@2.5.1 --silent >/dev/null
rm -rf jspdf && mkdir jspdf && tar -xzf jspdf-2.5.1.tgz -C jspdf --strip-components=1
rm jspdf-2.5.1.tgz
echo "jsPDF připraveno v tests/vendor/jspdf"
