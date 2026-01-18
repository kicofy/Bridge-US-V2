param(
    [string]$BaseUrl = "http://127.0.0.1:8000"
)

$apiBase = "$BaseUrl/api"
$random = Get-Random -Maximum 999999
$email = "test$random@example.com"
$password = "TestPass123!"
$displayName = "SearchUser$random"

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
        title = "Visa Search Test"
        content = "This post is about F1 visa and housing."
        language = "en"
        status = "published"
        tags = @("f1", "housing", "visa")
    } | ConvertTo-Json

    $createdPost = Invoke-RestMethod -Method Post -Uri "$apiBase/posts" -Headers $headers -ContentType "application/json" -Body $createBody
    if (-not $createdPost.id) {
        Write-Host "Post creation failed."
        exit 1
    }

    $postId = $createdPost.id

    $search = Invoke-RestMethod -Method Get -Uri "$apiBase/search?q=visa&language=en&limit=10&offset=0"
    if ($search.total -lt 1) {
        Write-Host "Search returned no results."
        exit 1
    }

    $tagSearch = Invoke-RestMethod -Method Get -Uri "$apiBase/search?tags=visa&language=en&limit=10&offset=0"
    if ($tagSearch.total -lt 1) {
        Write-Host "Tag filter returned no results."
        exit 1
    }

    $suggestions = Invoke-RestMethod -Method Get -Uri "$apiBase/search/suggestions?q=vi&limit=10"
    if ($suggestions.items.Count -lt 1) {
        Write-Host "Search suggestions empty."
        exit 1
    }

    $trending = Invoke-RestMethod -Method Get -Uri "$apiBase/search/trending?language=en&limit=10"
    if ($trending.items.Count -lt 1) {
        Write-Host "Trending results empty."
        exit 1
    }
} catch {
    Write-Host "Step7 search & discovery test failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step7 search & discovery test passed."
Write-Host ("post_id: {0}" -f $postId)

