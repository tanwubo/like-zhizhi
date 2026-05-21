# Production Deployment

This document describes how to deploy Like Zhizhi to a Linux server with PostgreSQL, Nginx, PM2, and S3-compatible object storage.

For Cloudflare Workers + D1 + R2 deployment, see `docs/development/cloudflare-deployment.zh-CN.md`.

## Target Runtime

- Ubuntu Linux server
- Node.js 22
- pnpm
- PostgreSQL
- S3-compatible object storage
- Nginx reverse proxy
- PM2 process manager
- Public domain with HTTPS

## 1. Install Server Dependencies

```bash
sudo apt update
sudo apt install -y git curl nginx postgresql postgresql-contrib
curl -fsSL https://get.pnpm.io/install.sh | sh -
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Verify:

```bash
node -v
pnpm -v
pm2 -v
```

## 2. Create PostgreSQL Database

```bash
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE USER like_zhizhi WITH PASSWORD 'replace-with-a-strong-password';
CREATE DATABASE like_zhizhi OWNER like_zhizhi;
GRANT ALL PRIVILEGES ON DATABASE like_zhizhi TO like_zhizhi;
\q
```

## 3. Clone The Project

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <repository-url> like-zhizhi
cd like-zhizhi
git checkout master
```

## 4. Configure Production Environment

Create `.env` in the project directory:

```bash
cp .env.example .env
nano .env
```

Required production values:

```env
DATABASE_URL="postgresql://like_zhizhi:replace-with-a-strong-password@localhost:5432/like_zhizhi?schema=public"
APP_URL="https://your-domain.example"

AUTH_COOKIE_NAME="like_zhizhi_session"
AUTH_SESSION_SECRET="replace-with-a-long-random-secret"

S3_ENDPOINT="https://your-s3-compatible-api-endpoint"
S3_REGION="your-region"
S3_BUCKET="like-zhizhi"
S3_ACCESS_KEY_ID="your-access-key-id"
S3_SECRET_ACCESS_KEY="your-secret-access-key"
S3_FORCE_PATH_STYLE="false"
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://your-public-storage-domain"

SEED_OWNER_EMAIL="owner@example.com"
SEED_OWNER_PASSWORD="replace-with-a-temporary-strong-password"
```

Generate a session secret:

```bash
openssl rand -base64 48
```

Keep `APP_URL` aligned with the final public HTTPS domain. The app uses it for sitemap, robots, and Open Graph metadata.

## 5. Install, Migrate, Seed, And Build

```bash
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm db:seed
pnpm build
```

`pnpm db:seed` regenerates Prisma Client before loading seed data, so it is safe to run immediately after pulling schema changes.
Run `pnpm db:seed` on first deployment to create initial site data and the owner account. Do not rerun it blindly after the site has real content unless you have reviewed the seed behavior.

## 6. Start With PM2

```bash
pm2 start "pnpm start" --name like-zhizhi
pm2 save
pm2 startup
```

`pm2 startup` prints a `sudo env ...` command. Copy and run that command once so the app restarts after server reboot.

Check status:

```bash
pm2 status
pm2 logs like-zhizhi
```

By default, `pnpm start` runs Next.js on port `3000`.

## 7. Configure Nginx

Create:

```bash
sudo nano /etc/nginx/sites-available/like-zhizhi
```

Use this config, replacing `your-domain.example`:

```nginx
server {
    listen 80;
    server_name your-domain.example;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/like-zhizhi /etc/nginx/sites-enabled/like-zhizhi
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Enable HTTPS

After the domain resolves to the server:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
```

Verify:

```bash
sudo systemctl status nginx
```

## 9. Release Verification

Open:

- `https://your-domain.example`
- `https://your-domain.example/login`
- `https://your-domain.example/sitemap.xml`
- `https://your-domain.example/robots.txt`

Admin checks:

- Log in with `SEED_OWNER_EMAIL` and `SEED_OWNER_PASSWORD`.
- Replace the temporary owner password immediately.
- Check site settings, module switches, media upload, messages, album, notes, footprints, checklist, love days, music, and analytics.
- Upload one image in `/admin/media`.
- Open the uploaded media URL directly in a browser.
- Confirm the PM2 logs do not show repeated runtime errors.

```bash
pm2 logs like-zhizhi
```

## 10. Updating An Existing Deployment

```bash
cd /var/www/like-zhizhi
git pull origin master
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm build
pm2 restart like-zhizhi
```

## Common Problems

- Login does not persist: check `APP_URL`, HTTPS, and `AUTH_SESSION_SECRET`.
- Media upload fails: check object-storage credentials, bucket name, region, and endpoint.
- Uploaded media URL returns 403: check bucket public read policy or custom public domain.
- Sitemap or Open Graph URLs point to localhost: update `APP_URL`.
- Build fails after pulling code: run `pnpm install --frozen-lockfile`, then `pnpm build` again and inspect the first real error.
- Build exits with `signal: SIGKILL` during `Creating an optimized production build`: check for an OS out-of-memory kill with `dmesg -T | tail -80` and `free -h`. The project config limits Next.js build concurrency, but very small servers may still need temporary swap or a larger build machine.
