# Step 01 基础架构与规范

## 目标
建立稳定、可扩展的后端基础架构与开发规范，确保后续模块可以快速迭代且易于维护。

## 范围
项目结构、配置管理、日志、错误处理、中间件、基础健康检查、质量规范。

## 前置条件
- 确认技术栈：FastAPI + PostgreSQL + Redis
- Python 3.11+ 环境可用

## 详细任务拆解
1. 项目结构与依赖
   - 目录结构：`app/`、`app/api/`、`app/core/`、`app/models/`、`app/services/`、`app/schemas/`、`app/tasks/`
   - 依赖管理：`requirements.txt` 或 `pyproject.toml`
2. 配置管理
   - 环境变量分层：本地/测试/生产
   - `settings` 统一读取数据库、缓存、JWT、外部服务
3. 日志与错误处理
   - JSON 结构化日志（含 request_id）
   - 统一错误响应格式（code/message/detail）
   - 全局异常处理器与业务异常类
4. 中间件与基础能力
   - CORS
   - 请求追踪 ID
   - 响应时间记录
5. 文档与接口基线
   - Swagger/OpenAPI 自动生成
   - `/health` 健康检查
6. 开发质量
   - lint/format：ruff/black/isort（任选组合）
   - 基础测试框架：pytest

## 产出物
- 可启动的 FastAPI 服务
- 基础目录与配置模板
- 统一错误响应格式与日志规范
- `/health` 接口

## 验收标准
- 服务启动无异常
- `/health` 返回 200 且包含服务状态
- 发生异常时返回统一错误结构
- 日志可追踪到 request_id

## 风险与注意
- 配置泄露风险：确保敏感变量不写入仓库
- 错误响应标准需与前端约定

