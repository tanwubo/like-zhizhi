# 生产环境部署指南

本文档说明如何把 Like Zhizhi 部署到一台 Linux 服务器上。默认方案是 PostgreSQL、Nginx、PM2 和 S3 兼容对象存储。

## 目标运行环境

- Ubuntu Linux 服务器
- Node.js 22
- pnpm
- PostgreSQL
- S3 兼容对象存储，例如阿里云 OSS
- Nginx 反向代理
- PM2 进程管理
- 已解析到服务器的域名和 HTTPS

## 1. 安装服务器依赖

```bash
sudo apt update
sudo apt install -y git curl nginx postgresql postgresql-contrib
curl -fsSL https://get.pnpm.io/install.sh | sh -
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

检查版本：

```bash
node -v
pnpm -v
pm2 -v
```

## 2. 创建 PostgreSQL 数据库

```bash
sudo -u postgres psql
```

进入 `psql` 后执行：

```sql
CREATE USER like_zhizhi WITH PASSWORD '替换成强密码';
CREATE DATABASE like_zhizhi OWNER like_zhizhi;
GRANT ALL PRIVILEGES ON DATABASE like_zhizhi TO like_zhizhi;
\q
```

## 3. 拉取项目代码

建议把项目放在 `/var/www`：

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <你的仓库地址> like-zhizhi
cd like-zhizhi
git checkout master
```

## 4. 配置生产环境变量

在项目目录创建 `.env`：

```bash
cp .env.example .env
nano .env
```

生产环境至少需要配置：

```env
DATABASE_URL="postgresql://like_zhizhi:替换成强密码@localhost:5432/like_zhizhi?schema=public"
APP_URL="https://你的域名"

AUTH_COOKIE_NAME="like_zhizhi_session"
AUTH_SESSION_SECRET="替换成足够长的随机字符串"

S3_ENDPOINT="https://你的对象存储API地址"
S3_REGION="你的对象存储地域"
S3_BUCKET="like-zhizhi"
S3_ACCESS_KEY_ID="你的AccessKeyId"
S3_SECRET_ACCESS_KEY="你的AccessKeySecret"
S3_FORCE_PATH_STYLE="false"
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://你的对象存储公开访问域名"

SEED_OWNER_EMAIL="owner@example.com"
SEED_OWNER_PASSWORD="替换成临时强密码"
```

生成 `AUTH_SESSION_SECRET`：

```bash
openssl rand -base64 48
```

注意：

- `APP_URL` 必须是最终线上 HTTPS 域名。
- `AUTH_SESSION_SECRET` 不要使用默认值。
- `S3_ENDPOINT` 是服务端上传文件用的 API 地址。
- `NEXT_PUBLIC_STORAGE_PUBLIC_URL` 是浏览器访问图片、视频等媒体文件用的公开地址。
- 如果使用阿里云 OSS，具体配置参考 `docs/development/aliyun-oss-local-test.md`，生产环境建议使用独立的生产 Bucket。

## 5. 安装依赖、迁移数据库、初始化数据、构建

```bash
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm db:seed
pnpm build
```

说明：

- `pnpm db:deploy` 用于执行 Prisma 生产迁移。
- `pnpm db:seed` 会先重新生成 Prisma Client，再写入种子数据，因此可以直接跟在 schema 变更后执行。
- 首次部署时执行 `pnpm db:seed`，用于创建初始站点数据和管理员账号。
- 站点已有真实内容后，不要不经检查反复执行 `pnpm db:seed`。

## 6. 使用 PM2 启动应用

```bash
pm2 start "pnpm start" --name like-zhizhi
pm2 save
pm2 startup
```

`pm2 startup` 会输出一行 `sudo env ...` 命令。复制并执行那一行，让服务器重启后能自动拉起应用。

查看运行状态：

```bash
pm2 status
pm2 logs like-zhizhi
```

默认情况下，`pnpm start` 会让 Next.js 监听 `3000` 端口。

## 7. 配置 Nginx 反向代理

创建 Nginx 站点配置：

```bash
sudo nano /etc/nginx/sites-available/like-zhizhi
```

写入以下内容，把 `你的域名` 替换成真实域名：

```nginx
server {
    listen 80;
    server_name 你的域名;

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

启用配置并重载 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/like-zhizhi /etc/nginx/sites-enabled/like-zhizhi
sudo nginx -t
sudo systemctl reload nginx
```

## 8. 配置 HTTPS

确认域名已经解析到服务器 IP 后，安装并运行 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名
```

检查 Nginx 状态：

```bash
sudo systemctl status nginx
```

## 9. 上线后验收

浏览器打开：

- `https://你的域名`
- `https://你的域名/login`
- `https://你的域名/sitemap.xml`
- `https://你的域名/robots.txt`

后台检查：

- 使用 `SEED_OWNER_EMAIL` 和 `SEED_OWNER_PASSWORD` 登录。
- 登录后立刻修改管理员密码。
- 检查站点设置、模块开关、媒体上传、留言、相册、点滴、足迹、清单、纪念日、音乐和统计。
- 在 `/admin/media` 上传一张图片。
- 直接打开上传后的媒体 URL，确认浏览器能访问。
- 查看 PM2 日志，确认没有持续报错。

```bash
pm2 logs like-zhizhi
```

## 10. 后续更新代码

每次发布新版本：

```bash
cd /var/www/like-zhizhi
git pull origin master
pnpm install --frozen-lockfile
pnpm db:deploy
pnpm build
pm2 restart like-zhizhi
```

## 常见问题

### 登录状态无法保持

检查：

- `APP_URL` 是否是线上 HTTPS 域名。
- 浏览器是否通过 HTTPS 访问。
- `AUTH_SESSION_SECRET` 是否配置了非默认值。

### 媒体上传失败

检查：

- 对象存储 AccessKey 是否正确。
- Bucket 名称是否正确。
- Region 和 Endpoint 是否匹配。
- AccessKey 是否有写入权限。

### 上传成功但图片打不开

检查：

- Bucket 或对象是否允许公开读取。
- 自定义域名是否已经绑定到 Bucket。
- DNS CNAME 是否已生效。
- `NEXT_PUBLIC_STORAGE_PUBLIC_URL` 是否是浏览器可访问的公开域名。

### sitemap 或分享图地址仍然指向 localhost

检查：

- `APP_URL` 是否仍是 `http://localhost:3000`。
- 修改 `.env` 后是否重新构建并重启应用。

### 拉取代码后构建失败

执行：

```bash
pnpm install --frozen-lockfile
pnpm build
```

优先查看构建日志里的第一个真实错误，不要只看最后的退出信息。
