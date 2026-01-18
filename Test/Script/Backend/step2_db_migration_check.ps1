param(
    [string]$BackendDir = "C:\Users\Ha22y\OneDrive\Desktop\Bridge US V2\WebSite\BackEnd"
)

if (!(Test-Path $BackendDir)) {
    Write-Host "Backend directory not found: $BackendDir"
    exit 1
}

Set-Location $BackendDir

if (!(Test-Path ".\bridgeus.db")) {
    Write-Host "SQLite database file not found. Run Alembic upgrade first."
    exit 1
}

if (!(Test-Path ".\alembic\versions")) {
    Write-Host "Alembic versions directory missing."
    exit 1
}

$migrationFiles = Get-ChildItem ".\alembic\versions" -Filter "*.py" -ErrorAction SilentlyContinue
if ($null -eq $migrationFiles -or $migrationFiles.Count -eq 0) {
    Write-Host "No Alembic migration files found."
    exit 1
}

Write-Host "Step2 DB migration check passed."
Write-Host ("Database file: {0}" -f (Resolve-Path ".\bridgeus.db"))
Write-Host ("Migration files: {0}" -f $migrationFiles.Count)

