# 高德地图足迹页配置

## 环境变量

- `NEXT_PUBLIC_AMAP_JSAPI_KEY`: 高德 Web 端 JSAPI Key。
- `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`: 本地开发可用的安全密钥。
- `NEXT_PUBLIC_AMAP_SERVICE_HOST`: 生产环境推荐使用的代理地址，例如 `https://example.com/_AMapService`。
- `AMAP_SECURITY_JS_CODE`: 生产代理服务使用的安全密钥。

## 本地开发

1. 在高德开放平台创建 Web 端 JSAPI Key。
2. 将 Key 写入项目本地 `.env`。
3. 本地可临时配置 `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`。
4. 启动 `pnpm dev`，访问 `/footprints`。

## 生产建议

生产环境不要把安全密钥暴露给浏览器。配置 `NEXT_PUBLIC_AMAP_SERVICE_HOST` 指向代理服务，由代理请求高德接口时追加 `jscode`。

Nginx 示例：

```nginx
location /_AMapService/ {
    set $amap_jscode "${AMAP_SECURITY_JS_CODE}";
    set $args "$args&jscode=$amap_jscode";
    proxy_pass https://restapi.amap.com/;
}
```

## 验证

- 未配置 Key 时，`/footprints` 显示列表 fallback，不白屏。
- 配置 Key 后，地图加载，城市点按排序值点亮。
- 点击城市或照片时，右侧详情展示该城市的记忆和图片。
