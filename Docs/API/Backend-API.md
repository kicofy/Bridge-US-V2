# BridgeUS 后端 API 文档（已实现）

## 1. 基础信息
- Base URL：`http://127.0.0.1:8000`
- API 前缀：`/api`
- 鉴权方式：`Authorization: Bearer <access_token>`
- 响应错误格式：
  ```json
  {
    "code": "error_code",
    "message": "Human readable message",
    "detail": null
  }
  ```

## 2. 认证与会话

### 2.1 注册
- **POST** `/api/auth/register`
- 请求体：
  ```json
  {
    "email": "test@example.com",
    "password": "TestPass123!",
    "display_name": "Alice",
    "code": "123456"
  }
  ```
- 响应：
  ```json
  {
    "access_token": "xxx",
    "refresh_token": "yyy",
    "token_type": "bearer"
  }
  ```
- 可能错误：`email_exists`

### 2.2 登录
- **POST** `/api/auth/login`
- 请求体：
  ```json
  {
    "email": "test@example.com",
    "password": "TestPass123!"
  }
  ```
- 响应：同注册
- 可能错误：`invalid_credentials`

### 2.3 刷新 Token
- **POST** `/api/auth/refresh`
- 请求体：
  ```json
  { "refresh_token": "yyy" }
  ```
- 响应：同注册
- 可能错误：`invalid_refresh`

### 2.4 登出
- **POST** `/api/auth/logout`
- 请求体：
  ```json
  { "refresh_token": "yyy" }
  ```
- 响应：
  ```json
  { "status": "ok" }
  ```

### 2.5 密码重置
- **POST** `/api/auth/reset-password`
- 需要鉴权
- 请求体：
  ```json
  { "current_password": "OldPass123!", "new_password": "NewPass123!" }
  ```
- 响应：`{ "status": "ok" }`

### 2.6 发送邮箱验证码
- **POST** `/api/auth/send-code`
- 请求体：
  ```json
  { "email": "test@example.com", "purpose": "register" }
  ```
- 响应：
  ```json
  { "status": "ok", "code": "123456" }
  ```
- 说明：仅 `local` 环境会返回 `code` 便于测试

### 2.7 忘记密码（验证码）
- **POST** `/api/auth/forgot-password`
- 请求体：
  ```json
  { "email": "test@example.com", "code": "123456", "new_password": "NewPass123!" }
  ```
- 响应：`{ "status": "ok" }`

## 3. 健康检查

### 3.1 Health
- **GET** `/api/health`
- 响应：
  ```json
  {
    "status": "ok",
    "service": "bridgeus-backend",
    "request_id": "uuid"
  }
  ```

## 4. 个人资料

### 4.1 获取我的资料
- **GET** `/api/profiles/me`
- 需要鉴权
- 响应：
  ```json
  {
    "user_id": "uuid",
    "display_name": "Alice",
    "avatar_url": null,
    "school_level": null,
    "location": null,
    "bio": null,
    "credibility_score": 0,
    "helpfulness_score": 0,
    "accuracy_score": 0
  }
  ```

### 4.2 更新我的资料
- **PATCH** `/api/profiles/me`
- 需要鉴权
- 请求体（任意字段可选）：
  ```json
  {
    "display_name": "Alice Zhang",
    "bio": "Hello BridgeUS",
    "location": "Boston"
  }
  ```
- 响应：同获取

## 5. 认证申请与审核

### 5.1 提交认证
- **POST** `/api/verification/submit`
- 需要鉴权
- 请求体：
  ```json
  { "docs_url": "https://example.com/verify-docs.png" }
  ```
- 响应：
  ```json
  { "request_id": "uuid", "status": "pending" }
  ```

### 5.2 查看认证状态
- **GET** `/api/verification/status`
- 需要鉴权
- 响应：无记录则返回 `null`
  ```json
  { "request_id": "uuid", "status": "approved" }
  ```

### 5.3 认证队列（管理员）
- **GET** `/api/verification/queue`
- 需要管理员
- 响应：
  ```json
  [
    { "id": "uuid", "user_id": "uuid", "status": "pending" }
  ]
  ```

### 5.4 认证通过（管理员）
- **POST** `/api/verification/{request_id}/approve`
- 需要管理员
- 响应：`{ "status": "ok" }`

### 5.5 认证拒绝（管理员）
- **POST** `/api/verification/{request_id}/reject`
- 需要管理员
- 响应：`{ "status": "ok" }`

## 6. 帖子与多语言

### 6.1 创建帖子
- **POST** `/api/posts`
- 需要鉴权
- 请求体：
  ```json
  {
    "title": "Hello World",
    "content": "This is a test post.",
    "language": "en",
    "status": "published",
    "category_id": null,
    "tags": ["f1", "housing"]
  }
  ```
- 响应（会返回指定语言版本）：
  ```json
  {
    "id": "uuid",
    "author_id": "uuid",
    "category_id": null,
    "status": "published",
    "language": "en",
    "title": "Hello World",
    "content": "This is a test post.",
    "tags": ["f1", "housing"],
    "helpful_count": 0,
    "accuracy_avg": 0,
    "accuracy_count": 0,
    "created_at": "2026-01-18T00:00:00Z",
    "published_at": "2026-01-18T00:00:00Z",
    "updated_at": "2026-01-18T00:00:00Z"
  }
  ```
- 说明：
  - `status=published` 会触发 AI 审核
  - `language` 目前仅支持 `en/zh`

### 6.2 列表查询
- **GET** `/api/posts?language=en&limit=20&offset=0`
- 响应：`PostResponse[]`

### 6.3 获取详情
- **GET** `/api/posts/{post_id}?language=zh`
- 响应：`PostResponse`

### 6.4 更新帖子
- **PATCH** `/api/posts/{post_id}`
- 需要鉴权（作者或管理员）
- 请求体（任意字段可选）：
  ```json
  {
    "title": "Updated",
    "content": "Updated content",
    "category_id": "uuid",
    "tags": ["visa", "opt"]
  }
  ```
- 响应：`PostResponse`

### 6.5 删除帖子
- **DELETE** `/api/posts/{post_id}`
- 需要鉴权（作者或管理员）
- 响应：`{ "status": "ok" }`

### 6.6 发布帖子
- **POST** `/api/posts/{post_id}/publish`
- 需要鉴权
- 响应：`PostResponse`

## 7. 回复

### 7.1 回复列表
- **GET** `/api/replies?post_id={post_id}&limit=20&offset=0`
- 响应：`ReplyResponse[]`（仅返回 `visible`，包含 `helpful_count`）

### 7.2 新增回复
- **POST** `/api/replies?post_id={post_id}`
- 需要鉴权
- 请求体：
  ```json
  { "content": "Thanks for sharing!" }
  ```
- 响应：`ReplyResponse`（包含 `helpful_count`）

### 7.3 更新回复
- **PATCH** `/api/replies/{reply_id}`
- 需要鉴权（作者）
- 请求体（任意字段可选）：
  ```json
  { "content": "Updated reply", "status": "visible" }
  ```
- 响应：`ReplyResponse`（包含 `helpful_count`）

### 7.4 删除回复
- **DELETE** `/api/replies/{reply_id}`
- 需要鉴权（作者）
- 响应：`{ "status": "ok" }`

### 7.5 隐藏回复（管理员）
- **PATCH** `/api/replies/{reply_id}/hide`
- 需要管理员
- 响应：`ReplyResponse`（包含 `helpful_count`）

### 7.6 删除回复（管理员）
- **DELETE** `/api/replies/{reply_id}/admin-delete`
- 需要管理员
- 响应：`{ "status": "ok" }`

## 8. 互动评分

### 8.1 帖子有用度（投票/取消）
- **POST** `/api/interactions/posts/{post_id}/helpful`
- **DELETE** `/api/interactions/posts/{post_id}/helpful`
- 需要鉴权
- 响应：`{ "status": "ok" }`

### 8.2 回复有用度（投票/取消）
- **POST** `/api/interactions/replies/{reply_id}/helpful`
- **DELETE** `/api/interactions/replies/{reply_id}/helpful`
- 需要鉴权
- 响应：`{ "status": "ok" }`

### 8.3 帖子准确度反馈
- **POST** `/api/interactions/posts/{post_id}/accuracy`
- 需要鉴权
- 请求体：
  ```json
  { "rating": 4, "note": "Mostly accurate." }
  ```
- 响应：`{ "status": "ok" }`

### 8.4 更新准确度反馈
- **PUT** `/api/interactions/posts/{post_id}/accuracy`
- 需要鉴权
- 请求体同上
- 响应：`{ "status": "ok" }`

### 8.5 删除准确度反馈
- **DELETE** `/api/interactions/posts/{post_id}/accuracy`
- 需要鉴权
- 响应：`{ "status": "ok" }`

## 9. 标签管理

### 9.1 获取标签列表
- **GET** `/api/tags`
- 响应：
  ```json
  [{ "id": "uuid", "name": "f1", "slug": "f1" }]
  ```

### 9.2 新建标签（管理员）
- **POST** `/api/tags`
- 需要管理员
- 请求体：
  ```json
  { "name": "Visa", "slug": "visa" }
  ```
- 响应：`TagResponse`

### 9.3 更新标签（管理员）
- **PATCH** `/api/tags/{tag_id}`
- 需要管理员
- 请求体（任意字段可选）：
  ```json
  { "name": "Visa Update", "slug": "visa-update" }
  ```
- 响应：`TagResponse`

### 9.4 删除标签（管理员）
- **DELETE** `/api/tags/{tag_id}`
- 需要管理员
- 响应：`{ "status": "ok" }`

## 10. 分类管理

### 8.1 获取分类列表
- **GET** `/api/categories`
- 响应：
  ```json
  [{ "id": "uuid", "name": "Visa", "slug": "visa", "sort_order": 0, "status": "active" }]
  ```

### 8.2 新建分类（管理员）
- **POST** `/api/categories`
- 需要管理员
- 请求体：
  ```json
  { "name": "Visa", "slug": "visa", "sort_order": 0, "status": "active" }
  ```
- 响应：`CategoryResponse`

### 8.3 更新分类（管理员）
- **PATCH** `/api/categories/{id}`
- 需要管理员
- 请求体（任意字段可选）：
  ```json
  { "name": "Visa & Immigration", "sort_order": 1 }
  ```
- 响应：`CategoryResponse`

### 8.4 删除分类（管理员）
- **DELETE** `/api/categories/{id}`
- 需要管理员
- 响应：`{ "status": "ok" }`

## 11. AI 审核与人工审核

### 9.1 审核日志（管理员）
- **GET** `/api/moderation/logs?limit=20&offset=0`
- 需要管理员
- 响应：`ModerationLogResponse[]`

### 9.2 单条审核记录（管理员）
- **GET** `/api/moderation/logs/{log_id}`
- 需要管理员

### 9.3 用户审核记录（管理员）
- **GET** `/api/moderation/users/{user_id}/logs`
- 需要管理员

### 9.4 我的审核记录（用户）
- **GET** `/api/moderation/me/logs`
- 需要鉴权

### 9.5 待审帖子队列（管理员）
- **GET** `/api/moderation/queue/posts`
- 需要管理员
- 响应：
  ```json
  [{ "id": "uuid", "author_id": "uuid", "status": "pending", "created_at": "..." }]
  ```

### 9.6 审核通过（管理员）
- **POST** `/api/moderation/posts/{post_id}/approve`
- 需要管理员
- 请求体（可选）：
  ```json
  { "reason": "Looks good" }
  ```
- 响应：
  ```json
  { "status": "ok", "post_id": "uuid", "post_status": "published" }
  ```

### 9.7 审核拒绝（管理员）
- **POST** `/api/moderation/posts/{post_id}/reject`
- 需要管理员
- 请求体（可选）：
  ```json
  { "reason": "Spam" }
  ```
- 响应同上（`post_status` 为 `hidden`）

### 9.8 提交申诉（用户）
- **POST** `/api/moderation/appeals`
- 需要鉴权
- 请求体：
  ```json
  { "target_type": "post", "target_id": "uuid", "reason": "I think this is a mistake." }
  ```
- 响应：`AppealResponse`

### 9.9 申诉列表（管理员）
- **GET** `/api/moderation/appeals`
- 需要管理员

### 9.10 申诉通过/拒绝（管理员）
- **POST** `/api/moderation/appeals/{appeal_id}/approve`
- **POST** `/api/moderation/appeals/{appeal_id}/reject`

## 12. 举报与管理后台

### 12.1 提交举报（用户）
- **POST** `/api/reports`
- 需要鉴权
- 请求体：
  ```json
  { "target_type": "post", "target_id": "uuid", "reason": "Spam", "evidence": "https://..." }
  ```
- 响应：`ReportResponse`

### 12.2 我的举报
- **GET** `/api/reports/me`
- 需要鉴权
- 响应：`ReportResponse[]`

### 12.3 举报列表（管理员）
- **GET** `/api/reports?limit=20&offset=0`
- 需要管理员
- 响应：`ReportResponse[]`

### 12.4 处理举报（管理员）
- **POST** `/api/reports/{report_id}/resolve`
- 需要管理员
- 请求体：
  ```json
  { "action": "hide", "note": "Confirmed" }
  ```
- `action` 可选：`hide` / `restore` / `reject`
- 说明：`restore` 会恢复为举报创建时的原始状态（若未知则默认 `published`）
- 响应：`ReportResponse`

### 12.5 用户封禁/解封（管理员）
- **POST** `/api/admin/users/{user_id}/ban`
- **POST** `/api/admin/users/{user_id}/unban`
- 响应：`{ "status": "ok", "user_id": "uuid", "user_status": "banned" }`

### 12.6 管理帖子（管理员）
- **POST** `/api/admin/posts/{post_id}/hide`
- **POST** `/api/admin/posts/{post_id}/restore`
- 响应：`{ "status": "ok", "post_id": "uuid", "post_status": "hidden" }`

### 12.7 管理回复（管理员）
- **POST** `/api/admin/replies/{reply_id}/hide`
- **POST** `/api/admin/replies/{reply_id}/restore`
- 响应：`{ "status": "ok", "reply_id": "uuid", "reply_status": "hidden" }`

### 12.8 用户列表（管理员）
- **GET** `/api/admin/users?limit=20&offset=0`
- 需要管理员
- 响应：`[{ "id": "uuid", "email": "test@example.com", "role": "user", "status": "active" }]`

### 12.9 审计日志（Root 管理员）
- **GET** `/api/admin/audit/logs?limit=50&offset=0`
- 仅 Root 管理员可访问
- 响应：`AuditLogResponse[]`

## 13. 角色与权限说明
- `user`：可发帖、更新资料、提交申诉
- `admin`：可管理分类/标签、审核队列、查看审核日志

## 14. 常见错误码
- `unauthorized`：未登录或 token 无效
- `forbidden`：权限不足
- `invalid_refresh`：refresh token 无效
- `post_not_found`：帖子不存在
- `category_not_found`：分类不存在
- `tag_not_found`：标签不存在
- `feedback_not_found`：反馈不存在
- `invalid_request`：请求无有效字段
- `invalid_code`：验证码无效或过期
- `invalid_target`：举报目标类型无效
- `report_not_found`：举报不存在
- `user_not_found`：用户不存在
- `email_not_configured`：邮件服务未配置
- `ai_not_configured`：AI 未配置
- `user_banned`：用户已被封禁

## 15. 搜索与发现

### 15.1 搜索
- **GET** `/api/search?q=visa&language=en&category_id={id}&tags=f1,h1b&sort=newest&limit=20&offset=0`
- `sort` 可选：`newest` / `helpful` / `accuracy`
- 响应：
  ```json
  { "items": [PostResponse], "total": 0 }
  ```

### 15.2 搜索建议
- **GET** `/api/search/suggestions?q=vis&limit=10`
- 响应：
  ```json
  { "items": ["visa", "visit", "visa-extension"] }
  ```

### 15.3 热门/趋势
- **GET** `/api/search/trending?language=en&limit=10`
- 响应：
  ```json
  { "items": [PostResponse] }
  ```

## 16. AI 服务

### 16.1 AI 问答
- **POST** `/api/ai/ask`
- 需要鉴权
- 请求体：
  ```json
  { "question": "How to apply for F1?" }
  ```
- 响应：
  ```json
  { "answer": "..." }
  ```

### 16.2 AI 翻译
- **POST** `/api/ai/translate`
- 需要鉴权
- 请求体：
  ```json
  { "text": "Hello", "source_lang": "en", "target_lang": "zh" }
  ```
- 响应：
  ```json
  { "text": "你好" }
  ```

### 16.3 AI 审核
- **POST** `/api/ai/moderate`
- 需要鉴权
- 请求体：
  ```json
  { "title": "Hi", "content": "Sample content" }
  ```
- 响应：
  ```json
  { "risk_score": 0, "labels": [], "decision": "pass", "reason": "" }
  ```

## 17. 通知

### 17.1 获取我的通知
- **GET** `/api/notifications?limit=20&offset=0`
- 需要鉴权
- 响应：`NotificationResponse[]`

### 17.2 通知已读（批量）
- **POST** `/api/notifications/read`
- 需要鉴权
- 请求体：
  ```json
  { "ids": ["uuid1", "uuid2"] }
  ```
- 响应：`{ "status": "ok" }`

### 17.3 全部已读
- **POST** `/api/notifications/read-all`
- 需要鉴权
- 响应：`{ "status": "ok" }`

### 17.4 管理员创建通知
- **POST** `/api/notifications`
- 需要管理员
- 请求体：
  ```json
  { "user_id": "uuid", "type": "report_resolved", "payload": { "report_id": "uuid" }, "dedupe_key": "report:uuid" }
  ```
- 响应：`NotificationResponse`

