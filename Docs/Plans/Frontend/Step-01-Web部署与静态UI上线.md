# Step 01 - Web 部署与静态 UI 上线

## 目标
- 以 `UI Design` 静态演示为唯一视觉基准，建立可部署的 Web 项目
- 完成首次线上部署，确保视觉效果 100% 一致

## 输入
- `UI Design/`（Vite + React 静态演示）
- `Docs/Plans/Frontend Development.md` 的页面规划

## 任务清单
1. **项目初始化**
   - 在 `apps/web` 或单独 `WebSite/FrontEnd` 中初始化 Vite + React + TS
   - 统一 ESLint / Prettier / tsconfig
2. **静态 UI 迁移**
   - 迁移 `UI Design/src` 的组件、样式、字体、图标
   - 保持 `index.css` / `styles/globals.css` 的层级与优先级
3. **环境配置**
   - 新建 `.env.example`：`VITE_API_BASE_URL`、`VITE_ASSET_BASE_URL`
   - 预留 `VITE_ENV=production/staging`
4. **构建与部署**
   - 验证 `pnpm build` 输出可部署静态包
   - 选择部署平台（Vercel / Netlify / OSS + CDN）
   - 配置自动部署分支（main / staging）
5. **视觉一致性验收**
   - 与 `UI Design` 对比：首页 / 详情 / 搜索 / 通知 / 管理后台
   - 允许轻微调整（间距/字号/颜色），不允许结构变化

## 交付物
- 可运行的 Web 静态站点
- 线上访问地址（staging / prod）
- 与 `UI Design` 对比截图

## 验收标准
- `UI Design` 视觉一致性 >= 95%
- `pnpm build` 无报错
- 线上可访问首页与任一详情页

## 风险与预案
- 字体或图标不一致：优先从 `UI Design` 迁移资源
- 组件样式冲突：限制全局样式覆盖范围

