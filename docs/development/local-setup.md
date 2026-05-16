# Local Setup

## Services

The app needs:

- PostgreSQL through `DATABASE_URL`
- Optional S3-compatible object storage for binary uploads
- Next.js web server on port `3000`

Use the ignored project-local `.env` for direct PostgreSQL and storage connection details. Docker Compose is available for disposable local services, but local development and e2e verification do not require Docker when `.env` points to reachable services.

Related docs:

- `docs/development/aliyun-oss-local-test.md`
- `docs/development/production-deployment.md`
- `docs/development/production-deployment.zh-CN.md`

## Commands

```powershell
pnpm install
Copy-Item .env.example .env -Force
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Verification

```powershell
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

## Docker Compose

Optional disposable services:

```powershell
docker compose down --remove-orphans
docker compose up -d --build
```

After startup, open:

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:9001`

## Production Checklist

1. Set `DATABASE_URL`, `APP_URL`, `AUTH_SESSION_SECRET`, and object-storage variables in the deployment environment.
2. Run `pnpm db:deploy` against the production database.
3. Run `pnpm build`.
4. Start with `pnpm start` behind the chosen process manager or platform runtime.
5. Keep `APP_URL` aligned with the public domain so sitemap, robots, and Open Graph metadata use the correct origin.
