# Cloudflare 部署指南

本文档说明如何把 Like Zhizhi 部署到 Cloudflare 平台。目标架构是 Workers 运行 Next.js 与后台 API，Workers Static Assets 托管静态资源，D1 保存业务数据，R2 保存媒体文件。

## 目标架构

- Cloudflare Workers：运行 Next.js、Route Handlers 和 Server Actions。
- Workers Static Assets：托管 `.open-next/assets` 内的静态资源。
- Cloudflare D1：替代 PostgreSQL 保存应用数据。
- Cloudflare R2：替代 S3 兼容对象存储保存上传媒体。
- Wrangler：负责本地预览、D1 迁移和线上部署。

## 1. 安装依赖并登录

```bash
pnpm install
pnpm wrangler login
```

确认 Wrangler 可用：

```bash
pnpm wrangler --version
```

## 2. 创建 D1 数据库

```bash
pnpm wrangler d1 create like-zhizhi
```

命令会返回 `database_id`。把它写入 `wrangler.jsonc`：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "like-zhizhi",
      "database_id": "替换成真实 database_id",
      "migrations_dir": "prisma/migrations-d1"
    }
  ]
}
```

本地 D1 和远程 D1 默认是隔离的。不要用 `--remote` 调试会破坏生产数据的命令。

## 3. 创建 R2 Bucket

```bash
pnpm wrangler r2 bucket create like-zhizhi-media
```

`wrangler.jsonc` 默认绑定名是 `MEDIA_BUCKET`，Bucket 名是 `like-zhizhi-media`。如果你在 Cloudflare 控制台使用了其他 Bucket 名，需要同步修改 `wrangler.jsonc`。

## 4. 配置环境变量和 Secret

至少配置这些值：

```bash
pnpm wrangler secret put AUTH_SESSION_SECRET
pnpm wrangler secret put SEED_OWNER_PASSWORD
```

建议在 Cloudflare 控制台或 Wrangler 环境配置中设置：

```env
APP_URL="https://你的域名"
AUTH_COOKIE_NAME="like_zhizhi_session"
NEXT_PUBLIC_STORAGE_PUBLIC_URL=""
SEED_OWNER_EMAIL="owner@example.com"
```

说明：

- `APP_URL` 必须是最终 HTTPS 域名。
- `AUTH_SESSION_SECRET` 必须是足够长的随机字符串。
- 如果 R2 配置了公开访问域名，把 `NEXT_PUBLIC_STORAGE_PUBLIC_URL` 设置为该域名。
- 如果不配置公开 R2 域名，应用会通过 `/api/media` 代理读取对象。

## 5. 执行 D1 迁移

本地验证：

```bash
pnpm db:d1:migrate:local
```

远程生产：

```bash
pnpm db:d1:migrate:remote
```

D1 迁移文件位于 `prisma/migrations-d1`。Cloudflare 部署不使用 `pnpm db:deploy`，该命令仍属于传统服务器部署路径。

## 6. 初始化数据

首次部署需要初始化站点数据和管理员账号：

```bash
pnpm db:seed
```

注意：站点已有真实内容后，不要不经检查反复执行 seed。

## 7. 构建和本地预览

```bash
pnpm preview:cloudflare
```

这个命令会先执行 OpenNext Cloudflare 构建，再通过 Wrangler 在本地启动 Workers 运行时，比普通 `pnpm dev` 更接近线上环境。

本地预览时检查：

- 首页是否渲染。
- `/login` 是否可打开。
- 登录后台是否成功。
- `/admin/media` 是否能上传媒体。
- 上传后的媒体 URL 是否能打开。

## 8. 部署

```bash
pnpm deploy:cloudflare
```

如果使用自定义域名，在 Cloudflare 控制台把域名路由到该 Worker，并确认 `APP_URL` 与线上域名一致。

## 9. 上线验收

浏览器打开：

- `https://你的域名`
- `https://你的域名/login`
- `https://你的域名/sitemap.xml`
- `https://你的域名/robots.txt`

后台检查：

- 使用 `SEED_OWNER_EMAIL` 和 `SEED_OWNER_PASSWORD` 登录。
- 登录后修改临时管理员密码。
- 检查站点设置、模块开关、媒体上传、留言、相册、点滴、足迹、清单、纪念日、音乐和统计。
- 上传一张图片。
- 直接打开上传后的媒体 URL 或 `/api/media/...` URL。

## 常见问题

### 构建提示 database_id 无效

`wrangler.jsonc` 中的 `database_id` 仍是示例值。先执行：

```bash
pnpm wrangler d1 create like-zhizhi
```

再把真实 `database_id` 写回配置。

### 登录状态无法保持

检查：

- `APP_URL` 是否是线上 HTTPS 域名。
- `AUTH_SESSION_SECRET` 是否已经通过 Wrangler secret 设置。
- 浏览器是否通过 HTTPS 访问。

### 媒体上传成功但打不开

检查：

- R2 Bucket 是否绑定为 `MEDIA_BUCKET`。
- 如果配置了 `NEXT_PUBLIC_STORAGE_PUBLIC_URL`，该域名是否能公开读取 R2 对象。
- 如果没有配置公开域名，确认 `/api/media/...` 代理路径可访问。

### D1 迁移失败

检查：

- 是否已经创建 D1 数据库。
- `wrangler.jsonc` 的 `database_id` 是否正确。
- 是否在生产环境误用了本地迁移，或在本地误用了 `--remote`。
