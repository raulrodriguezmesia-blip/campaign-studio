#!/bin/bash
# Verificar estructura del frontend

echo "📁 Verificando estructura de Campaign Studio Frontend..."
echo ""

files=(
  "index.html"
  "styles.css"
  "charts.css"
  "components.js"
  "app.js"
  "package.json"
  "k8s-deployment.yaml"
  "README.md"
  "assets/logo.svg"
)

all_ok=true

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file" 2>/dev/null || echo "0")
    echo "✅ $file ($size bytes)"
  else
    echo "❌ $file (FALTANTE)"
    all_ok=false
  fi
done

echo ""
if [ "$all_ok" = true ]; then
  echo "✨ ¡Todo está listo!"
  echo ""
  echo "🚀 Para servir:"
  echo "   npx serve . -l 8000"
  echo "   o"
  echo "   python -m http.server 8000"
  echo ""
  echo "🔗 Abrir: http://localhost:8000"
else
  echo "⚠️  Faltan archivos"
  exit 1
fi