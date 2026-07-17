# ============================================
# CAMPAIGN STUDIO - Quick Start Script
# ============================================

Write-Host "🚀 Starting Campaign Studio Frontend..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
$node = Get-Command node -ErrorAction SilentlyContinue
$python = Get-Command python -ErrorAction SilentlyContinue

# List generated files
Write-Host "📂 Generated Files:" -ForegroundColor Green
Get-ChildItem -Path "C:\Users\campaign-studio" -File | Where-Object { $_.Name -match '\.(html|css|js|yaml|json|md)$' } | ForEach-Object {
    Write-Host "  ✅ $($_.Name) ($($_.Length) bytes)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔗 Available at:" -ForegroundColor Green
Write-Host "   http://localhost:8000" -ForegroundColor Yellow
Write-Host ""

# Start server
if ($node) {
    Write-Host "✨ Starting with Node.js..." -ForegroundColor Green
    npx serve . -l 8000
} elseif ($python) {
    Write-Host "✨ Starting with Python..." -ForegroundColor Green
    python -m http.server 8000
} else {
    Write-Host "⚠️  Install Node.js or Python to run the server" -ForegroundColor Red
    Write-Host "   Download Node.js from: https://nodejs.org/" -ForegroundColor Gray
}