import { AdminActionForm } from "@/components/admin/action-form";
import { updateIntegrationSettings } from "@/features/admin/integration-actions";
import { getAdminIntegrationSettings } from "@/features/admin/integration-data";

const inputClass = "rounded-md border border-pink-100 px-3 py-2 text-sm outline-none focus:border-pink-300";
const labelClass = "grid gap-1 text-sm font-medium text-stone-700";
const emptySearchParams: Record<string, string | string[] | undefined> = {};

function stringConfig(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "string" ? value : "";
}

function numberConfig(config: Record<string, unknown>, key: string) {
  const value = config[key];
  return typeof value === "number" ? String(value) : "";
}

export default async function AdminIntegrationsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ integrations, storage }, params] = await Promise.all([
    getAdminIntegrationSettings(),
    searchParams ?? Promise.resolve(emptySearchParams)
  ]);
  const saved = params.saved === "1";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-pink-400">Integrations</p>
        <h1 className="text-3xl font-semibold text-stone-900">集成配置</h1>
        <p className="mt-2 text-sm text-stone-500">配置第三方服务。密钥不会在页面回显，留空表示保留已保存的值。</p>
      </div>

      {saved ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">配置已保存</div> : null}

      <AdminActionForm action={updateIntegrationSettings} className="space-y-4">
        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">地图服务</h2>
              <p className="text-sm text-stone-500">用于后续足迹地图渲染和地理能力扩展。</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input name="mapEnabled" type="checkbox" defaultChecked={integrations.map.enabled} />
              启用地图服务
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              地图服务商
              <select className={inputClass} name="mapProvider" defaultValue={integrations.map.provider}>
                <option value="none">未配置</option>
                <option value="amap">高德地图</option>
                <option value="mapbox">Mapbox</option>
                <option value="custom">自定义</option>
              </select>
            </label>
            <label className={labelClass}>
              地图服务 URL
              <input className={inputClass} name="mapApiBaseUrl" defaultValue={stringConfig(integrations.map.config, "apiBaseUrl")} />
            </label>
            <label className={labelClass}>
              地图公开 Key
              <input className={inputClass} name="mapPublicKey" defaultValue={stringConfig(integrations.map.config, "publicKey")} />
            </label>
            <label className={labelClass}>
              地图私密 Key
              <input className={inputClass} name="mapSecretKey" placeholder={integrations.map.secrets.secretKey?.placeholder} type="password" />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">天气服务</h2>
              <p className="text-sm text-stone-500">用于后续自动天气、地点天气等能力。</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input name="weatherEnabled" type="checkbox" defaultChecked={integrations.weather.enabled} />
              启用天气服务
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              天气服务商
              <select className={inputClass} name="weatherProvider" defaultValue={integrations.weather.provider}>
                <option value="none">未配置</option>
                <option value="openweather">OpenWeather</option>
                <option value="qweather">和风天气</option>
                <option value="custom">自定义</option>
              </select>
            </label>
            <label className={labelClass}>
              天气服务 URL
              <input
                className={inputClass}
                name="weatherApiBaseUrl"
                defaultValue={stringConfig(integrations.weather.config, "apiBaseUrl")}
              />
            </label>
            <label className={labelClass}>
              默认城市
              <input
                className={inputClass}
                name="weatherDefaultLocation"
                defaultValue={stringConfig(integrations.weather.config, "defaultLocation")}
              />
            </label>
            <label className={labelClass}>
              天气 API Key
              <input className={inputClass} name="weatherApiKey" placeholder={integrations.weather.secrets.apiKey?.placeholder} type="password" />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">邮件通知</h2>
              <p className="text-sm text-stone-500">用于留言提醒、系统通知等后台消息。</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input name="emailEnabled" type="checkbox" defaultChecked={integrations.email.enabled} />
              启用邮件通知
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              邮件服务商
              <select className={inputClass} name="emailProvider" defaultValue={integrations.email.provider}>
                <option value="none">未配置</option>
                <option value="smtp">SMTP</option>
                <option value="custom">自定义</option>
              </select>
            </label>
            <label className={labelClass}>
              SMTP 主机
              <input className={inputClass} name="emailHost" defaultValue={stringConfig(integrations.email.config, "host")} />
            </label>
            <label className={labelClass}>
              SMTP 端口
              <input className={inputClass} name="emailPort" defaultValue={numberConfig(integrations.email.config, "port")} inputMode="numeric" />
            </label>
            <label className={labelClass}>
              发件邮箱
              <input className={inputClass} name="emailFromEmail" defaultValue={stringConfig(integrations.email.config, "fromEmail")} />
            </label>
            <label className={labelClass}>
              SMTP 用户名
              <input className={inputClass} name="emailUsername" defaultValue={stringConfig(integrations.email.config, "username")} />
            </label>
            <label className={labelClass}>
              SMTP 密码
              <input
                className={inputClass}
                name="emailSmtpPassword"
                placeholder={integrations.email.secrets.smtpPassword?.placeholder}
                type="password"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">对象存储</h2>
              <p className="text-sm text-stone-500">上传仍使用环境变量，不在数据库保存 S3 密码。</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input name="storageEnabled" type="checkbox" defaultChecked={integrations.storage.enabled} />
              启用对象存储
            </label>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-stone-600 md:grid-cols-2">
            <p>状态：{storage.health.label}</p>
            <p>Bucket：{storage.bucket}</p>
            <p>Region：{storage.region}</p>
            <p>Public URL：{storage.publicBaseUrl}</p>
          </div>
        </section>

        <section className="rounded-lg border border-pink-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">音乐服务</h2>
              <p className="text-sm text-stone-500">可选外部歌单或音乐 API，当前公共播放器仍优先使用本地曲目。</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input name="musicEnabled" type="checkbox" defaultChecked={integrations.music.enabled} />
              启用音乐服务
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              音乐服务商
              <select className={inputClass} name="musicProvider" defaultValue={integrations.music.provider}>
                <option value="none">未配置</option>
                <option value="netease">网易云</option>
                <option value="custom">自定义</option>
              </select>
            </label>
            <label className={labelClass}>
              音乐服务 URL
              <input className={inputClass} name="musicApiBaseUrl" defaultValue={stringConfig(integrations.music.config, "apiBaseUrl")} />
            </label>
            <label className={labelClass}>
              音乐 API Key
              <input className={inputClass} name="musicApiKey" placeholder={integrations.music.secrets.apiKey?.placeholder} type="password" />
            </label>
          </div>
        </section>

        <button className="rounded-full bg-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-600" type="submit">
          保存集成配置
        </button>
      </AdminActionForm>
    </div>
  );
}
