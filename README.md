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

3. Start PostgreSQL and MinIO:

   ```powershell
   docker compose up -d postgres minio
   ```

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
