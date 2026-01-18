param(
    [string]$BaseUrl = "http://127.0.0.1:8000",
    [string]$AdminEmail,
    [string]$AdminPassword
)

if (-not $AdminEmail -or -not $AdminPassword) {
    Write-Host "AdminEmail and AdminPassword are required."
    exit 1
}

$apiBase = "$BaseUrl/api"
$random = Get-Random -Maximum 999999
$userEmail = "user$random@example.com"
$userPassword = "TestPass123!"
$displayName = "AdminTestUser$random"

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

try {
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

    $sendCode = Invoke-Api -Method Post -Url "$apiBase/auth/send-code" -Body @{
        email = $userEmail
        purpose = "register"
    }
    if (-not $sendCode.code) {
        Write-Host "User email code missing."
        exit 1
    }

    $register = Invoke-Api -Method Post -Url "$apiBase/auth/register" -Body @{
        email = $userEmail
        password = $userPassword
        display_name = $displayName
        code = $sendCode.code
    }
    $userToken = $register.access_token
    if (-not $userToken) {
        Write-Host "User register failed."
        exit 1
    }

    $userHeaders = @{ Authorization = "Bearer $userToken" }

    $category = Invoke-Api -Method Post -Url "$apiBase/categories" -Headers $adminHeaders -Body @{
        name = "Admin Test Category"
        slug = "admin-test-$random"
        sort_order = 0
        status = "active"
    }
    $categoryId = $category.id

    $updatedCategory = Invoke-Api -Method Patch -Url "$apiBase/categories/$categoryId" -Headers $adminHeaders -Body @{
        name = "Admin Test Category Updated"
    }
    if ($updatedCategory.name -ne "Admin Test Category Updated") {
        Write-Host "Category update failed."
        exit 1
    }

    $tag = Invoke-Api -Method Post -Url "$apiBase/tags" -Headers $adminHeaders -Body @{
        name = "AdminTag$random"
        slug = "admintag-$random"
    }
    $tagId = $tag.id

    $updatedTag = Invoke-Api -Method Patch -Url "$apiBase/tags/$tagId" -Headers $adminHeaders -Body @{
        name = "AdminTagUpdated$random"
    }
    if ($updatedTag.name -ne "AdminTagUpdated$random") {
        Write-Host "Tag update failed."
        exit 1
    }

    $post = Invoke-Api -Method Post -Url "$apiBase/posts" -Headers $userHeaders -Body @{
        title = "Admin Test Post"
        content = "Content for admin moderation."
        language = "en"
        status = "published"
        category_id = $categoryId
        tags = @("admintag-$random")
    }
    $postId = $post.id

    $reply = Invoke-Api -Method Post -Url "$apiBase/replies?post_id=$postId" -Headers $userHeaders -Body @{
        content = "Admin test reply"
    }
    $replyId = $reply.id

    $report = Invoke-Api -Method Post -Url "$apiBase/reports" -Headers $userHeaders -Body @{
        target_type = "post"
        target_id = $postId
        reason = "Spam"
        evidence = "https://example.com/evidence.png"
    }
    $reportId = $report.id

    $reportList = Invoke-Api -Method Get -Url "$apiBase/reports?limit=20&offset=0" -Headers $adminHeaders
    if ($reportList.Count -lt 1) {
        Write-Host "Admin reports list empty."
        exit 1
    }

    $resolved = Invoke-Api -Method Post -Url "$apiBase/reports/$reportId/resolve" -Headers $adminHeaders -Body @{
        action = "hide"
        note = "Resolved by admin"
    }
    if ($resolved.status -ne "resolved") {
        Write-Host "Resolve report failed."
        exit 1
    }

    $hidePost = Invoke-Api -Method Post -Url "$apiBase/admin/posts/$postId/hide" -Headers $adminHeaders
    if ($hidePost.post_status -ne "hidden") {
        Write-Host "Admin hide post failed."
        exit 1
    }

    $restorePost = Invoke-Api -Method Post -Url "$apiBase/admin/posts/$postId/restore" -Headers $adminHeaders
    if ($restorePost.post_status -ne "published") {
        Write-Host "Admin restore post failed."
        exit 1
    }

    $hideReply = Invoke-Api -Method Post -Url "$apiBase/admin/replies/$replyId/hide" -Headers $adminHeaders
    if ($hideReply.reply_status -ne "hidden") {
        Write-Host "Admin hide reply failed."
        exit 1
    }

    $restoreReply = Invoke-Api -Method Post -Url "$apiBase/admin/replies/$replyId/restore" -Headers $adminHeaders
    if ($restoreReply.reply_status -ne "visible") {
        Write-Host "Admin restore reply failed."
        exit 1
    }

    $users = Invoke-Api -Method Get -Url "$apiBase/admin/users?limit=20&offset=0" -Headers $adminHeaders
    if ($users.Count -lt 1) {
        Write-Host "Admin user list empty."
        exit 1
    }

    $ban = Invoke-Api -Method Post -Url "$apiBase/admin/users/$($users[0].id)/ban" -Headers $adminHeaders
    if ($ban.user_status -ne "banned") {
        Write-Host "Admin ban failed."
        exit 1
    }

    $unban = Invoke-Api -Method Post -Url "$apiBase/admin/users/$($users[0].id)/unban" -Headers $adminHeaders
    if ($unban.user_status -ne "active") {
        Write-Host "Admin unban failed."
        exit 1
    }

    $verification = Invoke-Api -Method Post -Url "$apiBase/verification/submit" -Headers $userHeaders -Body @{
        docs_url = "https://example.com/verify-docs.png"
    }
    if (-not $verification.request_id) {
        Write-Host "Verification submit failed."
        exit 1
    }

    $queue = Invoke-Api -Method Get -Url "$apiBase/verification/queue" -Headers $adminHeaders
    if ($queue.Count -lt 1) {
        Write-Host "Verification queue empty."
        exit 1
    }

    Invoke-Api -Method Post -Url "$apiBase/verification/$($verification.request_id)/approve" -Headers $adminHeaders

    $appeal = Invoke-Api -Method Post -Url "$apiBase/moderation/appeals" -Headers $userHeaders -Body @{
        target_type = "post"
        target_id = $postId
        reason = "Please review"
    }
    if (-not $appeal.id) {
        Write-Host "Appeal creation failed."
        exit 1
    }

    $appeals = Invoke-Api -Method Get -Url "$apiBase/moderation/appeals?limit=20&offset=0" -Headers $adminHeaders
    if ($appeals.Count -lt 1) {
        Write-Host "Appeals list empty."
        exit 1
    }

    Invoke-Api -Method Post -Url "$apiBase/moderation/appeals/$($appeal.id)/approve" -Headers $adminHeaders

    Invoke-Api -Method Delete -Url "$apiBase/tags/$tagId" -Headers $adminHeaders
    Invoke-Api -Method Delete -Url "$apiBase/categories/$categoryId" -Headers $adminHeaders

    $logs = Invoke-Api -Method Get -Url "$apiBase/moderation/logs?limit=20&offset=0" -Headers $adminHeaders
    if ($logs -eq $null) {
        Write-Host "Moderation logs request failed."
        exit 1
    }
} catch {
    Write-Host "Step8 admin full test failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step8 admin full test passed."

