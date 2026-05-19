import AMapLoader from "@amap/amap-jsapi-loader";

type AMapSecurityWindow = Window &
  typeof globalThis & {
    _AMapSecurityConfig?: {
      securityJsCode?: string;
      serviceHost?: string;
    };
  };

export type AMapLoadConfig = {
  key?: string;
  securityJsCode?: string;
  serviceHost?: string;
  plugins?: string[];
};

export type AMapLoadResult =
  | { ok: true; AMap: unknown }
  | { ok: false; reason: "missing-key" | "load-failed"; error?: unknown };

export function configureAMapSecurity(config: AMapLoadConfig) {
  const win = window as AMapSecurityWindow;

  if (config.serviceHost) {
    win._AMapSecurityConfig = { serviceHost: config.serviceHost };
    return;
  }

  if (config.securityJsCode) {
    win._AMapSecurityConfig = { securityJsCode: config.securityJsCode };
  }
}

export async function loadAMap(config: AMapLoadConfig): Promise<AMapLoadResult> {
  if (!config.key) {
    return { ok: false, reason: "missing-key" };
  }

  configureAMapSecurity(config);

  try {
    const AMap = await AMapLoader.load({
      key: config.key,
      version: "2.0",
      plugins: config.plugins ?? ["AMap.Scale"]
    });

    (AMap as { getConfig: () => { appname: string } }).getConfig().appname = "amap-jsapi-skill";

    return { ok: true, AMap };
  } catch (error) {
    return { ok: false, reason: "load-failed", error };
  }
}
