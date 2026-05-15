# Local Setup

## Services

The local stack uses:

- `postgres` on port `5432`
- `minio` on ports `9000` and `9001`
- `web` on port `3000`

## Commands

```powershell
pnpm install
Copy-Item .env.example .env -Force
docker compose up -d postgres minio
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

```powershell
docker compose down --remove-orphans
docker compose up -d --build
```

After startup, open:

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:9001`
