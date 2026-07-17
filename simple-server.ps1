# Servidor HTTP simple
$port = 8080
Set-Location "C:\Users\campaign-studio"

Write-Host "Starting server on port $port..."
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server running at http://localhost:$port"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.AbsolutePath
    if ($path -eq "/") { $path = "/index.html" }
    $file = "C:\Users\campaign-studio" + $path
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $context.Response.ContentType = "text/html"
        $writer = New-Object System.IO.StreamWriter($context.Response.OutputStream)
        $writer.Write($content)
        $writer.Close()
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.Close()
}