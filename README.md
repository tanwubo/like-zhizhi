# Like Zhizhi

Like Zhizhi is a from-scratch Next.js rebuild of a Pro-like couple website product.

## Local Development

1. Install dependencies:

   ```powershell
   pnpm install
   ```

2. Copy environment variables:

   ```powershell
   Copy-Item .env.example .env -Force
   ```

3. Point `.env` at local or remote PostgreSQL and S3-compatible storage.

   Local development in this repository uses the ignored project-local `.env` as the source of truth. Docker Compose is optional; do not commit machine-specific service credentials.

4. Apply database migrations and seed data:

   ```powershell
   pnpm db:migrate
   pnpm db:seed
   ```

5. Start the app:

   ```powershell
   pnpm dev
   ```

The public site runs at `http://localhost:3000`.

Seed admin account:

- Email: `owner@example.com`
- Password: `ChangeMe123!`

## Production Deployment

Set these environment variables before running migrations and starting the app:

- `DATABASE_URL`
- `APP_URL`
- `AUTH_SESSION_SECRET`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_STORAGE_PUBLIC_URL`

Deploy with:

```powershell
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm build
pnpm start
```

Before release, run:

```powershell
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```
