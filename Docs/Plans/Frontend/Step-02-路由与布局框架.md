# Step 02 - 路由与布局框架

## 目标
- 建立 Web 路由结构与全局布局
- 让 UI 结构与 `UI Design` 页面结构一致

## 输入
- `UI Design/src/components/*Page.tsx`
- 页面规划（首页/搜索/详情/发布/通知/个人/后台）

## 任务清单
1. **路由体系**
   - React Router 路由映射：`/`、`/search`、`/posts/:id`
   - 认证类：`/login`、`/register`、`/forgot-password`
   - 个人中心：`/me`、`/me/posts`、`/me/reports`
   - 后台：`/admin/*`
2. **布局与导航**
   - 抽离 `Navigation` / `CategorySidebar` / `BottomNav`
   - 统一 `AppLayout`（顶部导航 + 左侧栏 + 主体区）
3. **空白态与占位**
   - 页面全部可访问（无功能也可显示 UI）
   - 列表使用 mock 数据占位

## 交付物
- 可导航的页面结构
- 布局一致且可复用

## 验收标准
- 所有核心页面可访问
- 页面结构与 `UI Design` 一致

