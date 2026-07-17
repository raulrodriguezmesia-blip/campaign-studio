#!/bin/bash
# ============================================
# CAMPAIGN STUDIO - INICIADOR FRONTEND
# ============================================

echo "🚀 Iniciando Campaign Studio Frontend..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js no está instalado"
    echo "💡 Instala desde: https://nodejs.org/"
    echo "🔄 O usa: npx serve ."
fi

# Verificar si hay puerto 8000 disponible
if lsof -Pi :8000 -sTCP:LISTEN -t &> /dev/null; then
    echo "⚠️  Puerto 8000 ya está en uso"
    echo "🔧 Detén el proceso o cambia el puerto"
    exit 1
fi

echo "📂 Archivos generados:"
ls -lh *.html *.css *.js *.yaml 2>/dev/null || echo "  (archivos en el directorio actual)"

echo ""
echo "🔗 Servir en:"
echo "   http://localhost:8000"
echo ""

# Usar npx serve si está disponible
if command -v npx &> /dev/null; then
    echo "✨ Iniciando servidor..."
    npx serve . -l 8000
else
    # Fallback a Python HTTP server
    echo "✨ Iniciando servidor Python..."
    python -m http.server 8000
fi