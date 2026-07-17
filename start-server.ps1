# Servidor HTTP simple para Campaign Studio Frontend
param([int]$Port = 3000)

Set-Location "C:\Users\campaign-studio"
Write-Host "🔥 Starting Campaign Studio Frontend Server..." -ForegroundColor Cyan
Write-Host "🌐 Access at: http://localhost:$Port" -ForegroundColor Green

try {
    $server = New-Object System.Net.HttpListener
    $server.Prefixes.Add("http://localhost:$Port/")
    $server.Start()
    
    Write-Host "✅ Server running on port $Port"
    
    while ($server.IsListening) {
        $context = $server.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrEmpty($localPath)) { $localPath = "index.html" }
        
        $filePath = Join-Path "C:\Users\campaign-studio" $localPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = Get-Content $filePath -Raw
            $response.ContentType = "text/html"
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write([Text.Encoding]::UTF8.GetBytes($content), 0, $content.Length)
        } else {
            $response.StatusCode = 404
        }
        
        $response.Close()
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}