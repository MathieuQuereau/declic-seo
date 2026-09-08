# Petit serveur web local, sans dépendance (pas besoin de Node/Python).
# Usage : clic droit > "Executer avec PowerShell", ou dans un terminal :
#   powershell -ExecutionPolicy Bypass -File .\serve-local.ps1
# Puis ouvre http://localhost:8080/ dans ton navigateur.
# Ctrl+C dans le terminal pour arreter le serveur.

param(
  [int]$Port = 8080
)

$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host "Impossible de demarrer le serveur sur le port $Port. Il est peut-etre deja utilise." -ForegroundColor Red
  exit 1
}

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".json" = "application/json; charset=utf-8"
}

Write-Host "Serveur local demarre : $prefix" -ForegroundColor Green
Write-Host "Dossier servi : $root"
Write-Host "Appuie sur Ctrl+C pour arreter." -ForegroundColor Yellow

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $localPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
    if ($localPath -eq "/") { $localPath = "/index.html" }
    if ($localPath.EndsWith("/")) { $localPath = $localPath + "index.html" }

    $filePath = Join-Path $root ($localPath.TrimStart("/") -replace "/", "\")

    # Repertoire demande sans slash final -> on sert son index.html
    if (Test-Path $filePath -PathType Container) {
      $filePath = Join-Path $filePath "index.html"
    }

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $contentType = $mimeTypes[$ext]
      if (-not $contentType) { $contentType = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentType = $contentType
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Page non trouvee : $localPath")
      $response.OutputStream.Write($notFound, 0, $notFound.Length)
    }

    $response.OutputStream.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
