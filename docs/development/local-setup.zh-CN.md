# 本地开发环境

## 服务依赖

应用需要：

- 通过 `DATABASE_URL` 连接 PostgreSQL
- 可选的 S3 兼容对象存储，用于二进制文件上传
- 监听 `3000` 端口的 Next.js Web 服务

直接连接 PostgreSQL 和对象存储时，请使用被忽略的项目本地 `.env` 文件保存连接信息。Docker Compose 可用于一次性的本地服务，但当 `.env` 已指向可访问的服务时，本地开发和 e2e 验证不要求使用 Docker。

相关文档：

- `docs/development/aliyun-oss-local-test.md`
- `docs/development/aliyun-oss-local-test.zh-CN.md`
- `docs/development/production-deployment.md`
- `docs/development/production-deployment.zh-CN.md`

## 命令

```powershell
pnpm install
Copy-Item .env.example .env -Force
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## 验证

```powershell
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

## Docker Compose

可选的一次性服务：

```powershell
docker compose down --remove-orphans
docker compose up -d --build
```

启动后打开：

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:9001`

## 生产检查清单

1. 在部署环境中设置 `DATABASE_URL`、`APP_URL`、`AUTH_SESSION_SECRET` 和对象存储变量。
2. 对生产数据库运行 `pnpm db:deploy`。
3. 运行 `pnpm build`。
4. 在选定的进程管理器或平台运行时后面使用 `pnpm start` 启动。
5. 保持 `APP_URL` 和公开域名一致，让 sitemap、robots 和 Open Graph 元数据使用正确的源站地址。
