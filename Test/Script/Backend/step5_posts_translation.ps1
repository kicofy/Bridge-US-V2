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

$createBody = @{
    title = "Hello World"
    content = "This is a test post for translation."
    language = "en"
    status = "published"
    tags = @("f1", "housing")
} | ConvertTo-Json

    $created = Invoke-RestMethod -Method Post -Uri "$apiBase/posts" -Headers $headers -ContentType "application/json" -Body $createBody
    if (-not $created.id) {
        Write-Host "Post creation failed."
        exit 1
    }

    $postId = $created.id

$postEn = Invoke-RestMethod -Method Get -Uri "$apiBase/posts/${postId}?language=en"
if ($postEn.language -ne "en") {
        Write-Host "English translation not returned."
        exit 1
    }

$postZh = Invoke-RestMethod -Method Get -Uri "$apiBase/posts/${postId}?language=zh"
if ($postZh.language -ne "zh") {
        Write-Host "Chinese translation not returned."
        exit 1
    }

if ($postEn.tags.Count -lt 2) {
    Write-Host "Tags not returned."
    exit 1
}

$updateBody = @{
    tags = @("visa", "opt")
} | ConvertTo-Json

$updated = Invoke-RestMethod -Method Patch -Uri "$apiBase/posts/$postId" -Headers $headers -ContentType "application/json" -Body $updateBody
if ($updated.tags.Count -lt 2) {
    Write-Host "Tag update failed."
    exit 1
}
} catch {
    Write-Host "Step5 posts & translation test failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step5 posts & translation test passed."
Write-Host ("post_id: {0}" -f $postId)

