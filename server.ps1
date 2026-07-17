# ============================================
# CAMPAIGN STUDIO - Servidor de Archivos
# ============================================

$port = 8080
$location = "C:\Users\campaign-studio"

# Change directory
Set-Location $location

Write-Host "🚀 Starting Campaign Studio Frontend Server..." -ForegroundColor Cyan
Write-Host "📁 Serving from: $location" -ForegroundColor Green
Write-Host "🌐 Access at: http://localhost:$port" -ForegroundColor Yellow

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Prefixes.Add("http://0.0.0.0:$port/")

try {
    $listener.Start()
    Write-Host "✅ Server running on port $port" -ForegroundColor Green
    Write-Host "🔗 Press Ctrl+C to stop" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    exit 1
}

# Serve files
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.AbsolutePath
        if ($path -eq "/" -or $path -eq "") {
            $path = "/index.html"
        }
        
        $filePath = Join-Path $location $path.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = Get-Content $filePath -Raw
            $response.ContentType = "text/html"
            $response.ContentLength64 = $content.Length
            $writer = New-Object System.IO.StreamWriter($response.OutputStream)
            $writer.Write($content)
            $writer.Close()
        } else {
            $response.StatusCode = 404
            $response.StatusDescription = "Not Found"
        }
        
        $response.Close()
    } catch {
        # Ignore errors
    }
}