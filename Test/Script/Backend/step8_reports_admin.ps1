param(
    [string]$BaseUrl = "http://127.0.0.1:8000",
    [string]$AdminToken = ""
)

$apiBase = "$BaseUrl/api"
$random = Get-Random -Maximum 999999
$email = "test$random@example.com"
$password = "TestPass123!"
$displayName = "ReportUser$random"

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

    $postBody = @{
        title = "Step8 Report Post"
        content = "This is a post to be reported."
        language = "en"
        status = "published"
        tags = @("report", "test")
    } | ConvertTo-Json

    $createdPost = Invoke-RestMethod -Method Post -Uri "$apiBase/posts" -Headers $headers -ContentType "application/json" -Body $postBody
    if (-not $createdPost.id) {
        Write-Host "Post creation failed."
        exit 1
    }

    $postId = $createdPost.id

    $reportBody = @{
        target_type = "post"
        target_id = $postId
        reason = "Spam content"
        evidence = "https://example.com/evidence.png"
    } | ConvertTo-Json

    $report = Invoke-RestMethod -Method Post -Uri "$apiBase/reports" -Headers $headers -ContentType "application/json" -Body $reportBody
    if (-not $report.id) {
        Write-Host "Report creation failed."
        exit 1
    }

    $reportId = $report.id

    $myReports = Invoke-RestMethod -Method Get -Uri "$apiBase/reports/me" -Headers $headers
    if ($myReports.Count -lt 1) {
        Write-Host "My reports list is empty."
        exit 1
    }

    if ($AdminToken) {
        $adminHeaders = @{ Authorization = "Bearer $AdminToken" }

        $allReports = Invoke-RestMethod -Method Get -Uri "$apiBase/reports?limit=20&offset=0" -Headers $adminHeaders
        if ($allReports.Count -lt 1) {
            Write-Host "Admin report list is empty."
            exit 1
        }

        $resolveBody = @{
            action = "hide"
            note = "Confirmed by admin"
        } | ConvertTo-Json

        $resolved = Invoke-RestMethod -Method Post -Uri "$apiBase/reports/$reportId/resolve" -Headers $adminHeaders -ContentType "application/json" -Body $resolveBody
        if ($resolved.status -ne "resolved") {
            Write-Host "Report resolve failed."
            exit 1
        }

        $hiddenPost = Invoke-RestMethod -Method Get -Uri "$apiBase/posts/$postId?language=en"
        if ($hiddenPost.status -ne "hidden") {
            Write-Host "Post status not updated by report resolution."
            exit 1
        }

        $restore = Invoke-RestMethod -Method Post -Uri "$apiBase/admin/posts/$postId/restore" -Headers $adminHeaders
        if ($restore.post_status -ne "published") {
            Write-Host "Admin restore post failed."
            exit 1
        }
    } else {
        Write-Host "AdminToken not provided. Skipping admin tests."
    }
} catch {
    Write-Host "Step8 reports & admin test failed."
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Step8 reports & admin test passed."
Write-Host ("post_id: {0}" -f $postId)

