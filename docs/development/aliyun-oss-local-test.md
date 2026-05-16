# Aliyun OSS Local Test Plan

This project uses an S3-compatible storage adapter for admin media uploads. For Aliyun OSS, use a test bucket first, wire it into the local `.env`, upload a small image through `/admin/media`, and verify the stored public URL opens in a browser.

## What The App Needs

The app reads these environment variables:

```env
S3_ENDPOINT=""
S3_REGION=""
S3_BUCKET=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_FORCE_PATH_STYLE=""
NEXT_PUBLIC_STORAGE_PUBLIC_URL=""
```

Meaning:

- `S3_ENDPOINT`: server-side API endpoint used by the AWS S3 SDK to upload files.
- `S3_REGION`: OSS region id, for example `cn-hangzhou`.
- `S3_BUCKET`: bucket name.
- `S3_ACCESS_KEY_ID`: AccessKey ID with permission to write objects.
- `S3_SECRET_ACCESS_KEY`: AccessKey secret.
- `S3_FORCE_PATH_STYLE`: use `false` for Aliyun OSS S3-compatible endpoints.
- `NEXT_PUBLIC_STORAGE_PUBLIC_URL`: browser-facing base URL. The app appends the uploaded object key to this value.

The generated object keys look like:

```text
media/2026/05/16/153000-photo.jpg
```

If `NEXT_PUBLIC_STORAGE_PUBLIC_URL` is `https://static.example.com`, the stored public URL becomes:

```text
https://static.example.com/media/2026/05/16/153000-photo.jpg
```

## Recommended Local Test Shape

Use a separate OSS bucket for local testing:

```text
like-zhizhi-dev
```

Do not point local tests at the future production bucket. Local uploads are test data and should be disposable.

## 1. Create A Test Bucket

In Aliyun OSS console:

1. Create a bucket named `like-zhizhi-dev`.
2. Choose a region close to your server or your local network, for example `cn-hangzhou`.
3. Use Standard storage for testing.
4. Enable public read only if you accept that uploaded test files can be opened by anyone who knows the URL.

For a public couple site, the simplest path is:

- Bucket write: private, controlled by AccessKey.
- Object read: public, or served through a bound custom domain/CDN that can read from the bucket.

## 2. Prepare AccessKey

Create or choose a RAM user for this app instead of using the root account key.

For local testing, grant only the bucket permissions needed by this app:

- PutObject for upload.
- GetObject for read verification if the bucket is not fully public.
- ListBucket is optional for this app.

The app itself only writes objects and then stores public URLs in the database.

## 3. Choose Endpoint Values

Aliyun provides normal OSS endpoints and S3-compatible endpoints. Because this project uses `@aws-sdk/client-s3`, prefer the S3-compatible endpoint format:

```env
S3_ENDPOINT="https://s3.oss-cn-hangzhou.aliyuncs.com"
S3_REGION="cn-hangzhou"
S3_FORCE_PATH_STYLE="false"
```

Replace `cn-hangzhou` with the bucket's actual region.

## 4. Choose Public URL

Best long-term option:

```env
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://static.your-domain.example"
```

This requires binding a custom domain to the OSS bucket and adding the required CNAME record.

Temporary local test option:

```env
NEXT_PUBLIC_STORAGE_PUBLIC_URL="https://like-zhizhi-dev.oss-cn-hangzhou.aliyuncs.com"
```

Use the real bucket name and region. If direct browser access is blocked by your bucket policy or Aliyun default-domain restrictions, bind a custom domain and use that custom domain instead.

## 5. Local `.env` Example

Do not commit this file.

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

## 6. Run Local App

```powershell
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open:

```text
http://localhost:3000/login
```

Log in with `SEED_OWNER_EMAIL` and `SEED_OWNER_PASSWORD`.

## 7. Upload Test

1. Open `http://localhost:3000/admin/media`.
2. Upload a small `.jpg` or `.png`.
3. Confirm the page returns to the media center without an error.
4. Open the uploaded image URL directly in the browser.
5. Use the uploaded media in an album or note and verify it renders on the public page.

## 8. Troubleshooting

### AccessDenied

Check:

- AccessKey belongs to the expected Aliyun account.
- RAM policy allows writing to `acs:oss:*:*:like-zhizhi-dev/*`.
- Bucket name in `.env` exactly matches the OSS bucket.

### NoSuchBucket

Check:

- `S3_BUCKET` is correct.
- `S3_REGION` matches the bucket region.
- `S3_ENDPOINT` region matches the bucket region.

### SignatureDoesNotMatch

Check:

- `S3_ENDPOINT` uses the S3-compatible endpoint format.
- `S3_REGION` is the region id, for example `cn-hangzhou`.
- `S3_FORCE_PATH_STYLE` is `false`.
- The AccessKey secret has no leading or trailing spaces.

### Upload Succeeds But Browser URL Is 403

Check:

- Bucket or object public-read policy.
- Custom domain binding and CNAME.
- `NEXT_PUBLIC_STORAGE_PUBLIC_URL` uses the browser-facing domain, not the server-side API endpoint.

### Upload Succeeds But URL Is Wrong

Remember that the app joins:

```text
NEXT_PUBLIC_STORAGE_PUBLIC_URL + "/" + objectKey
```

Do not include a trailing object path in `NEXT_PUBLIC_STORAGE_PUBLIC_URL`. It should be the public base domain for the bucket.

## 9. Promote To Production

After local testing succeeds:

1. Create a separate production bucket, for example `like-zhizhi-prod`.
2. Create a production RAM user or production AccessKey.
3. Bind the final public storage domain, for example `static.your-domain.example`.
4. Update production `.env`.
5. Deploy the app.
6. Upload one image in production `/admin/media`.
7. Open the generated media URL directly in a browser.

Keep local and production buckets separate so local experiments cannot pollute production content.

## Official References

- Aliyun OSS regions and endpoints: `https://help.aliyun.com/zh/oss/regions-and-endpoints/`
- Aliyun OSS S3 SDK compatibility: `https://www.alibabacloud.com/help/en/oss/developer-reference/use-amazon-s3-sdks-to-access-oss`
- Aliyun OSS custom domains: `https://help.aliyun.com/zh/oss/user-guide/access-buckets-via-custom-domain-names`
