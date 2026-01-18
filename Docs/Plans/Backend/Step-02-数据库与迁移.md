# Step 02 数据库与迁移

## 目标
完成数据库连接、迁移体系与核心表结构初始化，为后续功能提供稳定数据基础。

## 前置条件
- Step 01 完成
- PostgreSQL 实例可用

## 详细任务拆解
1. ORM 与迁移
   - 选择 SQLAlchemy 2.x（异步）或 SQLModel
   - 集成 Alembic 迁移
   - 统一命名规范（snake_case、复数表名）
2. 核心表结构
   - 账号：`users`、`user_sessions`
   - 资料：`profiles`、`verification_requests`
   - 内容：`posts`、`post_translations`、`replies`、`reply_translations`
   - 分类：`categories`、`tags`、`post_tags`
   - 互动：`helpfulness_votes`、`accuracy_feedbacks`、`post_views`、`saved_posts`
   - 审核：`reports`、`moderation_actions`
   - 通知：`notifications`
   - 文件：`files`
3. 索引与约束
   - 唯一约束：`unique(post_id, language)`、邮箱/手机号唯一
   - 索引：`created_at`、`author_id`、`status`、`category_id`
4. 基础数据
   - 默认分类与标签 seed
   - 默认管理员账号（仅本地/测试）

## 产出物
- 初始迁移脚本
- 数据模型定义与关系映射
- 基础 seed 数据脚本

## 验收标准
- 数据库可迁移/回滚
- 核心表完整生成
- 索引与约束生效

## 风险与注意
- 迁移冲突需严格控制
- 多语言翻译表需保证唯一性与一致性

