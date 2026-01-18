param(
    [string]$BaseUrl = "http://127.0.0.1:8000"
)

$healthUrl = "$BaseUrl/api/health"

try {
    $response = Invoke-RestMethod -Method Get -Uri $healthUrl -TimeoutSec 5
} catch {
    Write-Host "Health check failed. Is the backend running?"
    Write-Host "URL: $healthUrl"
    Write-Host $_.Exception.Message
    exit 1
}

if ($null -eq $response.status -or $response.status -ne "ok") {
    Write-Host "Health check failed. Unexpected response:"
    $response | ConvertTo-Json -Depth 5 | Write-Host
    exit 1
}

Write-Host "Health check passed."
Write-Host ("status: {0}" -f $response.status)
Write-Host ("service: {0}" -f $response.service)
Write-Host ("request_id: {0}" -f $response.request_id)

