# 阿里云 OSS 本地测试方案

本项目使用 S3 兼容存储适配器处理后台媒体上传。测试阿里云 OSS 时，请先使用测试 Bucket，把它接入本地 `.env`，通过 `/admin/media` 上传一张小图片，并确认存储后的公开 URL 能在浏览器中打开。

## 应用需要的配置

应用会读取这些环境变量：

```env
S3_ENDPOINT=""
S3_REGION=""
S3_BUCKET=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_FORCE_PATH_STYLE=""
NEXT_PUBLIC_STORAGE_PUBLIC_URL=""
```

含义：

- `S3_ENDPOINT`：AWS S3 SDK 用于上传文件的服务端 API endpoint。
- `S3_REGION`：OSS 地域 ID，例如 `cn-hangzhou`。
- `S3_BUCKET`：Bucket 名称。
- `S3_ACCESS_KEY_ID`：具备对象写入权限的 AccessKey ID。
- `S3_SECRET_ACCESS_KEY`：AccessKey Secret。
- `S3_FORCE_PATH_STYLE`：阿里云 OSS S3 兼容 endpoint 使用 `false`。
- `NEXT_PUBLIC_STORAGE_PUBLIC_URL`：浏览器访问的基础 URL。应用会把上传后的对象 key 追加到该值后面。

生成的对象 key 形如：

```text
media/2026/05/16/153000-photo.jpg
```

如果 `NEXT_PUBLIC_STORAGE_PUBLIC_URL` 是 `https://static.example.com`，存储后的公开 URL 会变成：

```text
https://static.example.com/media/2026/05/16/153000-photo.jpg
```

## 推荐的本地测试形态

为本地测试使用独立 OSS Bucket：

```text
like-zhizhi-dev
```

不要把本地测试指向未来的生产 Bucket。本地上传是测试数据，应当可以随时清理。

## 1. 创建测试 Bucket

在阿里云 OSS 控制台中：

1. 创建名为 `like-zhizhi-dev` 的 Bucket。
2. 选择靠近服务器或本地网络的地域，例如 `cn-hangzhou`。
3. 测试时使用标准存储。
4. 只有在接受测试文件可被知道 URL 的任何人打开时，才启用公共读。

对公开情侣站点来说，最简单的方案是：

- Bucket 写入：私有，由 AccessKey 控制。
- 对象读取：公开读取，或通过绑定的自定义域名/CDN 读取 Bucket。

## 2. 准备 AccessKey

为本应用创建或选择 RAM 用户，不要使用主账号密钥。

本地测试时，只授予应用所需的 Bucket 权限：

- `PutObject` 用于上传。
- 如果 Bucket 不是完全公开的，`GetObject` 用于读取验证。
- `ListBucket` 对本应用来说是可选的。

应用本身只写入对象，然后把公开 URL 存入数据库。

## 3. 选择 Endpoint 值

阿里云提供普通 OSS endpoint 和 S3 兼容 endpoint。由于本项目使用 `@aws-sdk/client-s3`，优先使用 S3 兼容 endpoint 格式：

```env
S3_ENDPOINT="https://s3.oss-cn-hangzhou.aliyuncs.com"
S3_REGION="cn-hangzhou"
S3_FORCE_PATH_STYLE="false"
```

把 `cn-hangzhou` 替换成 Bucket 的实际地域。

## 4. 选择公开 URL

长期推荐方案：

```env
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://static.your-domain.example"
```

这需要给 OSS Bucket 绑定自定义域名，并添加所需的 CNAME 记录。

临时本地测试方案：

```env
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://like-zhizhi-dev.oss-cn-hangzhou.aliyuncs.com"
```

请使用真实 Bucket 名和地域。如果直连浏览器访问被 Bucket 策略或阿里云默认域名限制拦截，请绑定自定义域名并使用该自定义域名。

## 5. 本地 `.env` 示例

不要提交这个文件。

```env
DATABASE_URL="postgresql://like_zhizhi:like_zhizhi@localhost:5432/like_zhizhi?schema=public"
APP_URL="http://localhost:3000"
AUTH_COOKIE_NAME="like_zhizhi_session"
AUTH_SESSION_SECRET="replace-with-a-local-random-secret"

S3_ENDPOINT="https://s3.oss-cn-hangzhou.aliyuncs.com"
S3_REGION="cn-hangzhou"
S3_BUCKET="like-zhizhi-dev"
S3_ACCESS_KEY_ID="replace-with-aliyun-access-key-id"
S3_SECRET_ACCESS_KEY="replace-with-aliyun-access-key-secret"
S3_FORCE_PATH_STYLE="false"
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://like-zhizhi-dev.oss-cn-hangzhou.aliyuncs.com"

SEED_OWNER_EMAIL="owner@example.com"
SEED_OWNER_PASSWORD="ChangeMe123!"
```

## 6. 运行本地应用

```powershell
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

打开：

```text
http://localhost:3000/login
```

使用 `SEED_OWNER_EMAIL` 和 `SEED_OWNER_PASSWORD` 登录。

## 7. 上传测试

1. 打开 `http://localhost:3000/admin/media`。
2. 上传一个小的 `.jpg` 或 `.png` 文件。
3. 确认页面回到媒体中心且没有报错。
4. 在浏览器中直接打开上传后的图片 URL。
5. 在相册或点滴中使用上传的媒体，并确认它能在公开页面正常渲染。

## 8. 故障排查

### AccessDenied

检查：

- AccessKey 属于预期的阿里云账号。
- RAM 策略允许写入 `acs:oss:*:*:like-zhizhi-dev/*`。
- `.env` 中的 Bucket 名称与 OSS Bucket 完全一致。

### NoSuchBucket

检查：

- `S3_BUCKET` 正确。
- `S3_REGION` 与 Bucket 地域一致。
- `S3_ENDPOINT` 地域与 Bucket 地域一致。

### SignatureDoesNotMatch

检查：

- `S3_ENDPOINT` 使用 S3 兼容 endpoint 格式。
- `S3_REGION` 是地域 ID，例如 `cn-hangzhou`。
- `S3_FORCE_PATH_STYLE` 是 `false`。
- AccessKey Secret 没有前后空格。

### 上传成功但浏览器 URL 返回 403

检查：

- Bucket 或对象的公共读策略。
- 自定义域名绑定和 CNAME。
- `NEXT_PUBLIC_STORAGE_PUBLIC_URL` 使用浏览器可访问的域名，而不是服务端 API endpoint。

### 上传成功但 URL 不正确

请记住应用会拼接：

```text
NEXT_PUBLIC_STORAGE_PUBLIC_URL + "/" + objectKey
```

不要在 `NEXT_PUBLIC_STORAGE_PUBLIC_URL` 中包含尾部对象路径。它应该是 Bucket 的公开基础域名。

## 9. 推进到生产环境

本地测试成功后：

1. 创建独立的生产 Bucket，例如 `like-zhizhi-prod`。
2. 创建生产 RAM 用户或生产 AccessKey。
3. 绑定最终公开存储域名，例如 `static.your-domain.example`。
4. 更新生产 `.env`。
5. 部署应用。
6. 在生产环境 `/admin/media` 上传一张图片。
7. 直接在浏览器中打开生成的媒体 URL。

保持本地和生产 Bucket 分离，避免本地实验污染生产内容。

## 官方参考

- 阿里云 OSS 地域和 endpoint：`https://help.aliyun.com/zh/oss/regions-and-endpoints/`
- 阿里云 OSS S3 SDK 兼容性：`https://www.alibabacloud.com/help/en/oss/developer-reference/use-amazon-s3-sdks-to-access-oss`
- 阿里云 OSS 自定义域名：`https://help.aliyun.com/zh/oss/user-guide/access-buckets-via-custom-domain-names`
