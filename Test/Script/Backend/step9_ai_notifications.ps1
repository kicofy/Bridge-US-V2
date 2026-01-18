param(
    [string]$BaseUrl = "http://127.0.0.1:8000",
    [string]$AdminEmail = "",
    [string]$AdminPassword = ""
)

$apiBase = "$BaseUrl/api"
$random = Get-Random -Maximum 999999
$email = "aiuser$random@example.com"
$password = "TestPass123!"
$displayName = "AIUser$random"

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = $null,
        [object]$Body = $null
    )
    if ($Body) {
        return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -ContentType "application/json" -Body ($Body | ConvertTo-Json)
    }
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers
}

function Get-Token {
    param(
        [string]$Email,
        [string]$DisplayName
    )

    $sendCode = Invoke-Api -Method Post -Url "$apiBase/auth/send-code" -Body @{
        email = $Email
        purpose = "register"
    }
    if (-not $sendCode.code) {
        Write-Host "Email verification code missing. Check email settings."
        exit 1
    }

    $register = Invoke-Api -Method Post -Url "$apiBase/auth/register" -Body @{
        email = $Email
        password = $password
        display_name = $DisplayName
        code = $sendCode.code
    }
    return $register.access_token
}

try {
    $accessToken = Get-Token -Email $email -DisplayName $displayName
    if (-not $accessToken) {
        Write-Host "Failed to register and get access token."
        exit 1
    }

    $headers = @{ Authorization = "Bearer $accessToken" }

    $ask = Invoke-Api -Method Post -Url "$apiBase/ai/ask" -Headers $headers -Body @{
        question = "What is BridgeUS?"
    }
    if (-not $ask.answer) {
        Write-Host "AI ask failed."
        exit 1
    }

    $translate = Invoke-Api -Method Post -Url "$apiBase/ai/translate" -Headers $headers -Body @{
        text = "Hello"
        source_lang = "en"
        target_lang = "zh"
    }
    if (-not $translate.text) {
        Write-Host "AI translate failed."
        exit 1
    }

    $moderate = Invoke-Api -Method Post -Url "$apiBase/ai/moderate" -Headers $headers -Body @{
        title = "Hi"
        content = "Sample content"
    }
    if ($null -eq $moderate.decision) {
        Write-Host "AI moderate failed."
        exit 1
    }

    $notifList = Invoke-Api -Method Get -Url "$apiBase/notifications?limit=20&offset=0" -Headers $headers
    if ($notifList -eq $null) {
        Write-Host "Notifications list failed."
        exit 1
    }

    if ($notifList.Count -gt 0) {
        $ids = @($notifList[0].id)
        Invoke-Api -Method Post -Url "$apiBase/notifications/read" -Headers $headers -Body @{
            ids = $ids
        }
    }

    Invoke-Api -Method Post -Url "$apiBase/notifications/read-all" -Headers $headers

    if ($AdminEmail -and $AdminPassword) {
        $adminLogin = Invoke-Api -Method Post -Url "$apiBase/auth/login" -Body @{
            email = $AdminEmail
            password = $AdminPassword
        }
        $adminToken = $adminLogin.access_token
        if (-not $adminToken) {
            Write-Host "Admin login failed."
            exit 1
        }

        $adminHeaders = @{ Authorization = "Bearer $adminToken" }
    $profile = Invoke-Api -Method Get -Url "$apiBase/profiles/me" -Headers $headers
    $adminCreate = Invoke-Api -Method Post -Url "$apiBase/notifications" -Headers $adminHeaders -Body @{
        user_id = $profile.user_id
            type = "admin_notice"
            payload = @{ message = "Test notice" }
        dedupe_key = "admin_notice_$random"
        }
        if (-not $adminCreate.id) {
            Write-Host "Admin create notification failed."
            exit 1
        }
    } else {
        Write-Host "Admin credentials not provided. Skipping admin notification test."
    }
} catch {
    Write-Host "Step9 AI & notifications test failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step9 AI & notifications test passed."

