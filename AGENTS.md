<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# digital-finance-mobile — AI 开发代理规范

## 项目身份
- **名称**: 数字金融彩票 - 移动端前端
- **端口**: 16020
- **技术栈**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + daisyUI 5
- **包管理器**: yarn

## 关键约定
- 遵循 `../.clinerules`（根 Rule）和本目录 `.clinerules`
- 移动端优先设计，设计基准 375px
- 触摸交互: 最小点击区域 44x44px
- 考虑 iOS Safe Area、键盘弹出等移动端特有问题
- 性能敏感: 减少首屏 JS 体积，使用骨架屏

## 快速命令
- `yarn dev` — 启动开发服务器 (端口 16020)
- `yarn lint` — 代码检查
- `yarn build` — 生产构建
- `yarn start` — 启动生产服务器

## 关联服务
- Go 后端: http://localhost:16080
- AI 服务: http://localhost:16081
- 统一入口 (Nginx): http://localhost:16000