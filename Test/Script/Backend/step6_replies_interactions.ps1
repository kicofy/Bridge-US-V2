param(
    [string]$BaseUrl = "http://127.0.0.1:8000",
    [string]$AdminToken = ""
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
        title = "Step6 Post"
        content = "This is a Step6 test post."
        language = "en"
        status = "draft"
        tags = @("f1", "housing")
    } | ConvertTo-Json

    $createdPost = Invoke-RestMethod -Method Post -Uri "$apiBase/posts" -Headers $headers -ContentType "application/json" -Body $createBody
    if (-not $createdPost.id) {
        Write-Host "Post creation failed."
        exit 1
    }

    $postId = $createdPost.id

    $replyBody = @{ content = "First reply" } | ConvertTo-Json
    $reply = Invoke-RestMethod -Method Post -Uri "$apiBase/replies?post_id=$postId" -Headers $headers -ContentType "application/json" -Body $replyBody
    if (-not $reply.id) {
        Write-Host "Reply creation failed."
        exit 1
    }

    $replyId = $reply.id

    if ($reply.helpful_count -ne 0) {
        Write-Host "Reply helpful_count should start at 0."
        exit 1
    }

    $replyList = Invoke-RestMethod -Method Get -Uri "$apiBase/replies?post_id=$postId&limit=20&offset=0"
    if ($replyList.Count -lt 1) {
        Write-Host "Reply list failed."
        exit 1
    }

    $updateReplyBody = @{ content = "Updated reply" } | ConvertTo-Json
    $updatedReply = Invoke-RestMethod -Method Patch -Uri "$apiBase/replies/$replyId" -Headers $headers -ContentType "application/json" -Body $updateReplyBody
    if ($updatedReply.content -ne "Updated reply") {
        Write-Host "Reply update failed."
        exit 1
    }

    Invoke-RestMethod -Method Post -Uri "$apiBase/interactions/posts/$postId/helpful" -Headers $headers
    Invoke-RestMethod -Method Post -Uri "$apiBase/interactions/replies/$replyId/helpful" -Headers $headers

    $accuracyBody = @{ rating = 4; note = "Mostly accurate." } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "$apiBase/interactions/posts/$postId/accuracy" -Headers $headers -ContentType "application/json" -Body $accuracyBody

    $postEn = Invoke-RestMethod -Method Get -Uri "$apiBase/posts/${postId}?language=en"
    if ($postEn.helpful_count -ne 1 -or $postEn.accuracy_count -ne 1) {
        Write-Host "Post stats not updated."
        exit 1
    }

    $updatedAccuracyBody = @{ rating = 5; note = "Updated note." } | ConvertTo-Json
    Invoke-RestMethod -Method Put -Uri "$apiBase/interactions/posts/$postId/accuracy" -Headers $headers -ContentType "application/json" -Body $updatedAccuracyBody
    Invoke-RestMethod -Method Delete -Uri "$apiBase/interactions/posts/$postId/accuracy" -Headers $headers

    Invoke-RestMethod -Method Delete -Uri "$apiBase/interactions/posts/$postId/helpful" -Headers $headers
    Invoke-RestMethod -Method Delete -Uri "$apiBase/interactions/replies/$replyId/helpful" -Headers $headers

    $postEnAfter = Invoke-RestMethod -Method Get -Uri "$apiBase/posts/${postId}?language=en"
    if ($postEnAfter.helpful_count -ne 0) {
        Write-Host "Post helpful_count not updated after unvote."
        exit 1
    }

    Invoke-RestMethod -Method Delete -Uri "$apiBase/replies/$replyId" -Headers $headers

    if ($AdminToken) {
        $adminHeaders = @{ Authorization = "Bearer $AdminToken" }
        $adminReplyBody = @{ content = "Admin review reply" } | ConvertTo-Json
        $adminReply = Invoke-RestMethod -Method Post -Uri "$apiBase/replies?post_id=$postId" -Headers $headers -ContentType "application/json" -Body $adminReplyBody
        $adminReplyId = $adminReply.id

        $hiddenReply = Invoke-RestMethod -Method Patch -Uri "$apiBase/replies/$adminReplyId/hide" -Headers $adminHeaders
        if ($hiddenReply.status -ne "hidden") {
            Write-Host "Admin hide failed."
            exit 1
        }

        Invoke-RestMethod -Method Delete -Uri "$apiBase/replies/$adminReplyId/admin-delete" -Headers $adminHeaders
    } else {
        Write-Host "AdminToken not provided. Skipping admin hide/delete tests."
    }
} catch {
    Write-Host "Step6 replies & interactions test failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step6 replies & interactions test passed."
Write-Host ("post_id: {0}" -f $postId)

