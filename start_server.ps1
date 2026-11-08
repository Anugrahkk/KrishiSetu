<#
.SYNOPSIS
    KrishiSetu - Zero-Dependency Local Web Server
    Runs using built-in .NET HttpListener. No Python or external dependencies needed.
#>

param(
    [int]$Port = 5000
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    # If 5000 is occupied, try 5050
    $Port = 5050
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  🌾 KrishiSetu (കൃഷിസേതു) Web Server is LIVE!" -ForegroundColor Yellow
Write-Host "  👉 URL: $prefix" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".ico"  = "image/x-icon"
}

$pageRoutes = @{
    "/"                 = "templates/index.html"
    "/login"            = "templates/login.html"
    "/register"         = "templates/register.html"
    "/farmer"           = "templates/farmer/dashboard.html"
    "/farmer/inputs"    = "templates/farmer/inputs.html"
    "/farmer/doctor"    = "templates/farmer/doctor.html"
    "/farmer/sell"      = "templates/farmer/sell.html"
    "/farmer/vets"      = "templates/farmer/vets.html"
    "/farmer/cart"      = "templates/farmer/cart.html"
    "/farmer/orders"    = "templates/farmer/orders.html"
    "/buyer"            = "templates/buyer/home.html"
    "/buyer/produce"    = "templates/buyer/produce.html"
    "/buyer/cart"       = "templates/buyer/cart.html"
    "/buyer/orders"     = "templates/buyer/orders.html"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.AbsolutePath
        if ($path.EndsWith("/") -and $path.Length -gt 1) {
            $path = $path.TrimEnd("/")
        }

        # Check for /buyer/product/{id}
        if ($path -match '^/buyer/product/\d+') {
            $path = "templates/buyer/product.html"
        }

        # Enable CORS for API
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        # Handle API endpoints
        if ($path -eq "/api/health") {
            $json = '{"ok": true, "service": "KrishiSetu Web Server", "version": "1.0.0", "status": "online"}'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $response.ContentType = "application/json"
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        $targetFile = $null

        if ($pageRoutes.ContainsKey($path)) {
            $targetFile = $pageRoutes[$path]
        } elseif ($path.StartsWith("/static/")) {
            $targetFile = $path.Substring(1)
        } elseif ($path -eq "templates/buyer/product.html") {
            $targetFile = "templates/buyer/product.html"
        }

        if ($targetFile -and (Test-Path $targetFile)) {
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $mime = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $response.ContentType = $mime
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # Try 404
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 - Not Found</h1><p>Resource '$path' not found.</p><a href='/'>Go to KrishiSetu Home</a>")
            $response.ContentType = "text/html; charset=utf-8"
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }

        $response.Close()
    } catch {
        # Keep server running even if single request errors
    }
}

