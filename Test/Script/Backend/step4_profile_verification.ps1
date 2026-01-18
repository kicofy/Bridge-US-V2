param(
    [string]$BaseUrl = "http://127.0.0.1:8000"
)

$apiBase = "$BaseUrl/api"
$random = Get-Random -Maximum 999999
$email = "test$random@example.com"
$password = "TestPass123!"
$displayName = "TestUser$random"

function Get-Token {
    param(
        [string]$Email,
        [string]$DisplayName
    )

    $sendCodeBody = @{
        email = $Email
        purpose = "register"
    } | ConvertTo-Json

    $sendCode = Invoke-RestMethod -Method Post -Uri "$apiBase/auth/send-code" -ContentType "application/json" -Body $sendCodeBody
    if (-not $sendCode.code) {
        Write-Host "Email verification code missing. Check email settings."
        exit 1
    }

    $registerBody = @{
        email = $Email
        password = $password
        display_name = $DisplayName
        code = $sendCode.code
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Method Post -Uri "$apiBase/auth/register" -ContentType "application/json" -Body $registerBody
    return $register.access_token
}

try {
    $accessToken = Get-Token -Email $email -DisplayName $displayName
    if (-not $accessToken) {
        Write-Host "Failed to register and get access token."
        exit 1
    }

    $headers = @{
        Authorization = "Bearer $accessToken"
    }

    $profileResult = Invoke-RestMethod -Method Get -Uri "$apiBase/profiles/me" -Headers $headers
    if ($profileResult.display_name -ne $displayName) {
        Write-Host "Profile display name mismatch."
        exit 1
    }

    $updateBody = @{
        bio = "Hello BridgeUS"
        location = "Boston"
    } | ConvertTo-Json

    $updated = Invoke-RestMethod -Method Patch -Uri "$apiBase/profiles/me" -Headers $headers -ContentType "application/json" -Body $updateBody
    if ($updated.bio -ne "Hello BridgeUS" -or $updated.location -ne "Boston") {
        Write-Host "Profile update failed."
        exit 1
    }

    $submitBody = @{
        docs_url = "https://example.com/verify-docs.png"
    } | ConvertTo-Json

    $verification = Invoke-RestMethod -Method Post -Uri "$apiBase/verification/submit" -Headers $headers -ContentType "application/json" -Body $submitBody
    if (-not $verification.request_id) {
        Write-Host "Verification submit failed."
        exit 1
    }

    $status = Invoke-RestMethod -Method Get -Uri "$apiBase/verification/status" -Headers $headers
    if ($null -eq $status) {
        Write-Host "Verification status returned null."
        exit 1
    }
} catch {
    Write-Host "Step4 profile & verification test failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step4 profile & verification test passed."
Write-Host ("email: {0}" -f $email)

