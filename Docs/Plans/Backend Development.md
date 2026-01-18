# BridgeUS 后端开发文档（FastAPI）

## 1. 范围与目标
建设一个支持 BridgeUS 的后端系统，覆盖可信社区内容、AI 问答、信誉体系与安全互动。后端需对前端提供 REST API，处理认证、内容质量规则与 AI 服务接入。

## 2. 技术栈建议
- 框架：FastAPI
- 语言：Python 3.11+
- 数据库：PostgreSQL（主库），Redis（缓存 / 限流 / 任务）
- ORM：SQLAlchemy 2.x（异步）或 SQLModel
- 鉴权：JWT（access + refresh），可选 OAuth
- 文件存储：S3 兼容存储（媒体 / 认证资料）
- 任务队列：Celery / RQ / Dramatiq
- 观测：OpenTelemetry + 结构化日志

## 3. 核心模块
1. **认证与用户**
2. **个人资料与认证**
3. **帖子与回复**
4. **评分系统（有用度 / 准确度 / 可信度）**
5. **搜索与发现**
6. **AI 问答与翻译**
7. **内容审核与举报**
8. **通知**
9. **管理后台**
10. **分析（可选）**

## 4. 功能需求清单

### 4.1 认证与用户
- 注册 / 登录 / 登出
- 邮箱或手机号验证
- 密码重置
- JWT 访问与刷新
- 账号停用 / 删除
- 角色体系：用户 / 版主 / 管理员

### 4.2 个人资料与认证
- 个人资料查看与编辑
- 公共字段：显示名、学段、地区、徽章
- 私密字段：真实姓名、认证材料
- 认证提交与审核流程（ID 上传）
- 认证通过后更新可信度与徽章

### 4.3 帖子与回复
- 帖子增删改查
- 回复增删改查
- 分类与标签
- 分页与排序（最新 / 有用 / 准确）
- 帖子详情 + 回复列表
- 浏览数 / 回复数统计

### 4.4 评分体系
- 帖子/回复有用度投票
- 使用后准确度反馈
- 可信度分数（认证 + 行为信号）
- 反滥用：单用户单次投票、限流

### 4.5 搜索与发现
- 帖子全文检索
- 按分类 / 签证类型 / 主题 / 语言 / 学段筛选
- 热门主题（基于近期互动）
- 推荐内容（基于个人资料与行为）

### 4.6 AI 问答与翻译
- AI 问答接口：
  - 用户问题
  - 相关帖子检索
  - 生成回答
- 帖子/评论翻译接口
- AI 输出安全过滤
- Prompt 记录（不含 PII）

### 4.7 内容审核与举报
- 举报内容（帖子 / 回复 / 用户）
- 审核队列与状态（待审 / 已审 / 已处理）
- AI 或规则筛查（广告/推广检测）
- 内容下架与用户警告

### 4.8 通知
- 站内通知：回复、@提及、认证状态
- 可选邮件通知

### 4.9 管理后台
- 用户、帖子、认证申请管理
- 分类/标签/政策文案配置
- 基础统计（增长、举报、处理效率）

## 5. API 轮廓（更完整）

**认证**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `POST /auth/verify-phone`
- `POST /auth/resend-code`
- `POST /auth/deactivate`

**用户**
- `GET /users/me`
- `PATCH /users/me`
- `GET /users/{user_id}`
- `GET /users/{user_id}/posts`
- `GET /users/{user_id}/replies`
- `GET /users/{user_id}/badges`

**认证**
- `POST /verification/submit`
- `GET /verification/status`
- `POST /verification/review`（管理员）
- `GET /verification/queue`（管理员）
- `POST /verification/{request_id}/approve`（管理员）
- `POST /verification/{request_id}/reject`（管理员）

**帖子**
- `GET /posts`
- `POST /posts`
- `GET /posts/{post_id}`
- `PATCH /posts/{post_id}`
- `DELETE /posts/{post_id}`
- `POST /posts/{post_id}/publish`
- `POST /posts/{post_id}/unpublish`
- `POST /posts/{post_id}/view`
- `POST /posts/{post_id}/save`（收藏）
- `DELETE /posts/{post_id}/save`

**回复**
- `POST /posts/{post_id}/replies`
- `GET /posts/{post_id}/replies`
- `PATCH /replies/{reply_id}`
- `DELETE /replies/{reply_id}`
- `POST /replies/{reply_id}/view`
- `POST /replies/{reply_id}/report`

**评分**
- `POST /posts/{post_id}/helpful`
- `POST /posts/{post_id}/accuracy`
- `POST /replies/{reply_id}/helpful`
- `DELETE /posts/{post_id}/helpful`
- `DELETE /replies/{reply_id}/helpful`
- `GET /users/me/ratings`

**搜索**
- `GET /search`
- `GET /search/suggestions`
- `GET /search/trending`

**AI**
- `POST /ai/qa`
- `POST /ai/translate`
- `POST /ai/moderate`
- `GET /ai/models`

**审核**
- `POST /reports`
- `GET /moderation/queue`（版主/管理员）
- `POST /moderation/action`（版主/管理员）
- `GET /reports`
- `GET /reports/{report_id}`
- `POST /reports/{report_id}/resolve`（版主/管理员）
- `POST /reports/{report_id}/dismiss`（版主/管理员）

**通知**
- `GET /notifications`
- `POST /notifications/read`
- `POST /notifications/read-all`
- `DELETE /notifications/{notification_id}`

**分类 / 标签**
- `GET /categories`
- `GET /tags`
- `POST /categories`（管理员）
- `PATCH /categories/{category_id}`（管理员）
- `DELETE /categories/{category_id}`（管理员）
- `POST /tags`（管理员）
- `PATCH /tags/{tag_id}`（管理员）
- `DELETE /tags/{tag_id}`（管理员）

**文件与媒体**
- `POST /files/upload`
- `GET /files/{file_id}`
- `DELETE /files/{file_id}`

**管理后台**
- `GET /admin/users`
- `PATCH /admin/users/{user_id}`
- `POST /admin/users/{user_id}/ban`
- `POST /admin/users/{user_id}/unban`
- `GET /admin/posts`
- `GET /admin/replies`
- `GET /admin/stats`

## 6. 数据模型（完整结构）

### 6.1 账号与认证
- `users`：id, email(唯一), phone(唯一), password_hash, role, status, created_at, updated_at, last_login_at
- `user_sessions`：id, user_id, refresh_token_hash, device_info, ip, expires_at, revoked_at
- `profiles`：user_id, display_name, avatar_url, school_level, location, bio, credibility_score, helpfulness_score, accuracy_score, badges, updated_at
- `verification_requests`：id, user_id, status, docs_file_id, reviewer_id, reviewed_at, created_at

### 6.2 内容与多语言
- `posts`：id, author_id, category_id, original_language, status(draft/published/hidden), created_at, published_at, updated_at
- `post_translations`：id, post_id, language, title, content, summary, translated_by(ai/user), model, status(ready/pending/failed), created_at, updated_at
  - 约束：`unique(post_id, language)`
- `replies`：id, post_id, author_id, status, created_at, updated_at
- `reply_translations`（可选）：id, reply_id, language, content, translated_by, status, created_at

### 6.3 分类与标签
- `categories`：id, name, slug, sort_order, status
- `tags`：id, name, slug
- `post_tags`：post_id, tag_id

### 6.4 互动与评分
- `helpfulness_votes`：id, user_id, target_type(post/reply), target_id, created_at
- `accuracy_feedbacks`：id, user_id, post_id, rating, note, created_at
- `post_views`：id, post_id, user_id(nullable), ip, created_at
- `saved_posts`：user_id, post_id, created_at

### 6.5 审核与举报
- `reports`：id, reporter_id, target_type, target_id, reason, status, created_at, resolved_at
- `moderation_actions`：id, moderator_id, target_type, target_id, action, reason, created_at

### 6.6 通知与消息
- `notifications`：id, user_id, type, payload, read_at, created_at

### 6.7 文件与媒体
- `files`：id, owner_id, purpose(avatar/verification/post), url, mime, size, created_at, deleted_at

## 7. 关键流程

**用户发帖**
1. 用户提交帖子
2. AI 筛查广告/推广
3. 发布后写入 `posts`，并生成多语言翻译写入 `post_translations`
4. 安全则发布，否则进入审核

**AI 问答**
1. 搜索相关帖子
2. 基于安全策略生成回答
3. 返回回答 + 相关帖子

**认证流程**
1. 用户提交证件
2. 管理员审核
3. 通过后更新可信度与徽章

## 8. 安全与合规
- 认证与 AI 接口限流
- 认证资料与 PII 隔离存储
- 审核与管理操作审计日志
- AI 输出安全过滤
- GDPR 风格的删除流程

## 9. 非功能需求
- 常规接口响应 < 300ms
- 支持 10k MAU 规模
- I/O 全异步
- 备份与容灾

## 10. 开发里程碑建议
- M1：认证 + 基本帖子 + 个人资料
- M2：评分 + 搜索
- M3：AI 问答 + 翻译
- M4：审核 + 管理后台 + 认证
- M5：通知 + 分析
 

