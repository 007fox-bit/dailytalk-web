# DailyTalk 网页版

生活英语与高考句式学习网站，包含 36 类场景、4,765 道原创与改编练习、错题间隔复习、8 张学习卡片、收藏、每日签到、答案提示和学习周报。基于本地 DailyTalk-Tourist 小程序的最新版题库与学习规则迁移。

## 使用

- 学习首页：`/`，公开访问，无需注册。
- 站长数据：`/admin`，通过 ChatGPT 登录，服务器仅允许环境变量配置的所有者邮箱访问。
- 数据说明：`/privacy.html`。
- 练习进度存入 D1 数据库，通过 HttpOnly 签名 Cookie 识别浏览器。清除 Cookie 或更换浏览器不能自动找回旧进度；微信旧数据不会自动迁移。
- 首次访问创建独立学习记录，不使用小程序里的演示经验或连续签到数据。

后台包含访问次数、独立浏览器、练习开启/完成轮次、提交正确率、错题复习次数、热门场景、设备分布和最近 100 个活跃匿名浏览器的累计进度，支持今天/近 7 天/近 30 天，按北京时间归属。

独立浏览器不是实际人数，统计从上线后开始。关闭匿名统计或启用 DNT/GPC 后不再新增统计，个人学习进度仍保存。提交正确率包含重复尝试与提示后的提交；经验仅奖励本轮独立首次答对的题目。

## 本地运行

需要 Node.js 22.13 或更高版本（使用内置 SQLite），建议 Node.js 24。

```sh
corepack pnpm install --frozen-lockfile
node build.mjs
node serve.mjs
```

打开 `http://127.0.0.1:4180`。本地预览的站长登录是模拟登录，仅在绑定 127.0.0.1 的 `serve.mjs` 中存在；正式 Worker 不包含模拟登录，依赖 Sites 验证的身份头。不得直接将预览服务暴露到公网。

本地数据库位于忽略的 `.sites-runtime/preview.sqlite`。源码、生成题库、数据库结构和测试可以公开；数据库、密钥、Cookie 和真实学习记录不得提交。

## 检查

```sh
node --test tests/site.test.mjs
node build.mjs
```

测试覆盖完整十题练习、错误记录与复习排期、重复提交去重、访问计数、匿名/非所有者权限拒绝、伪造 Cookie、跨站写入、并发版本冲突、输入长度、统计退出与时区/跨月日期。

可选浏览器检查：安装 Playwright 并启动本地服务，执行 `node tests/browser.mjs`；默认使用本机 Edge，运行结果和截图写入忽略的 `.sites-runtime`。

## 部署

正式输出为 Cloudflare Workers 兼容的 `dist/server/index.js`，默认导出 `fetch(request, env)`。公开前配置 `DB` D1 绑定以及 `SITE_ORIGIN`、`SESSION_SECRET`、`ANALYTICS_OWNER_EMAIL`。会话密钥必须是安全随机值，并作为托管服务端秘密保存。

Sites 项目配置位于 `.openai/hosting.json`。使用 Sites 发布流程保存源码版本及构建归档，按顺序应用 `drizzle` 中的迁移，再发布。数据库 schema 修改后运行 `pnpm exec drizzle-kit generate`，已上线迁移应保持不变。

GitHub 存放源代码；带数据库和私人后台的正式网站由 Sites 托管。GitHub Pages 的静态托管不能独立运行本项目的数据接口。

## 目录

- `public/`：自适应学习界面、后台和隐私说明。
- `lib/`：小程序题库与复习规则；网页版统一使用北京时间、补零日期。
- `server/worker.mjs`：学习操作、数据保存、会话校验和后台统计。
- `db/` 与 `drizzle/`：数据库结构和版本化迁移。
- `tests/`：服务端回归检查和可选浏览器流程检查。

高考专区是原创仿真练习，不等同于官方真题。保留题库原有来源说明与元数据。
