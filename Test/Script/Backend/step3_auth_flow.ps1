param(
    [string]$BaseUrl = "http://127.0.0.1:8000"
)

$apiBase = "$BaseUrl/api/auth"
$random = Get-Random -Maximum 999999
$email = "test$random@example.com"
$password = "TestPass123!"
$displayName = "TestUser$random"

try {
    $sendCodeBody = @{
        email = $email
        purpose = "register"
    } | ConvertTo-Json

    $sendCode = Invoke-RestMethod -Method Post -Uri "$apiBase/send-code" -ContentType "application/json" -Body $sendCodeBody
    if (-not $sendCode.code) {
        Write-Host "Email verification code missing. Check email settings."
        exit 1
    }

    $registerBody = @{
        email = $email
        password = $password
        display_name = $displayName
        code = $sendCode.code
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Method Post -Uri "$apiBase/register" -ContentType "application/json" -Body $registerBody

    if (-not $register.access_token -or -not $register.refresh_token) {
        Write-Host "Register failed: missing tokens."
        exit 1
    }

    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Method Post -Uri "$apiBase/login" -ContentType "application/json" -Body $loginBody

    if (-not $login.access_token -or -not $login.refresh_token) {
        Write-Host "Login failed: missing tokens."
        exit 1
    }

    $resetCodeBody = @{
        email = $email
        purpose = "reset"
    } | ConvertTo-Json

    $resetCode = Invoke-RestMethod -Method Post -Uri "$apiBase/send-code" -ContentType "application/json" -Body $resetCodeBody
    if (-not $resetCode.code) {
        Write-Host "Reset code missing. Check email settings."
        exit 1
    }

    $newPassword = "NewPass123!"
    $forgotBody = @{
        email = $email
        code = $resetCode.code
        new_password = $newPassword
    } | ConvertTo-Json

    $forgot = Invoke-RestMethod -Method Post -Uri "$apiBase/forgot-password" -ContentType "application/json" -Body $forgotBody
    if ($forgot.status -ne "ok") {
        Write-Host "Forgot password failed."
        exit 1
    }

    $loginNewBody = @{
        email = $email
        password = $newPassword
    } | ConvertTo-Json

    $loginNew = Invoke-RestMethod -Method Post -Uri "$apiBase/login" -ContentType "application/json" -Body $loginNewBody
    if (-not $loginNew.access_token -or -not $loginNew.refresh_token) {
        Write-Host "Login with new password failed."
        exit 1
    }

    $refreshBody = @{
        refresh_token = $loginNew.refresh_token
    } | ConvertTo-Json

    $refresh = Invoke-RestMethod -Method Post -Uri "$apiBase/refresh" -ContentType "application/json" -Body $refreshBody

    if (-not $refresh.access_token -or -not $refresh.refresh_token) {
        Write-Host "Refresh failed: missing tokens."
        exit 1
    }

    $logoutBody = @{
        refresh_token = $refresh.refresh_token
    } | ConvertTo-Json

    $logout = Invoke-RestMethod -Method Post -Uri "$apiBase/logout" -ContentType "application/json" -Body $logoutBody

    if ($logout.status -ne "ok") {
        Write-Host "Logout failed: unexpected response."
        exit 1
    }
} catch {
    Write-Host "Step3 auth flow failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step3 auth flow passed."
Write-Host ("email: {0}" -f $email)

