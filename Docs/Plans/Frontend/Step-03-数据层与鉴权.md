# Step 03 - 数据层与鉴权

## 目标
- 接入后端 API
- 完成登录/注册/重置密码等完整鉴权链路

## 输入
- `Docs/API/Backend-API.md`
- 认证与验证码流程

## 任务清单
1. **API Client**
   - 统一 `fetch/axios` 封装，处理错误码
   - 自动刷新 token
2. **鉴权状态**
   - auth store：token、user、role
   - localStorage/sessionStorage 策略
3. **页面接入**
   - 登录 / 注册 / 忘记密码
   - 发送验证码、校验验证码
4. **权限控制**
   - 未登录访问限制
   - 管理员路由守卫

## 交付物
- 完整登录/注册/重置密码流程
- 可访问的个人中心入口

## 验收标准
- 用户可注册、登录、登出
- token 过期可刷新

