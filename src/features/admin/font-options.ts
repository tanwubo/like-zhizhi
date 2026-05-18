export type FontRole = "body" | "display" | "romance" | "number";

export type FontOption = {
  key: string;
  label: string;
  stack: string;
};

export const FONT_ROLE_DEFAULTS: Record<FontRole, string> = {
  body: "modern-soft",
  display: "serif-gentle",
  romance: "wenkai",
  number: "mono-classic"
};

const fontOptionGroups: Record<FontRole, FontOption[]> = {
  body: [
    {
      key: "modern-soft",
      label: "现代柔和",
      stack: '"Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
    },
    {
      key: "apple-system",
      label: "系统清爽",
      stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    },
    {
      key: "noto-sans",
      label: "思源黑体",
      stack: '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif'
    },
    {
      key: "harmony",
      label: "HarmonyOS",
      stack: '"HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'
    },
    {
      key: "rounded",
      label: "圆润正文",
      stack: '"Nunito", "PingFang SC", "Microsoft YaHei", sans-serif'
    }
  ],
  display: [
    {
      key: "serif-gentle",
      label: "温柔宋体",
      stack: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
    },
    {
      key: "songti",
      label: "系统宋体",
      stack: '"Songti SC", "SimSun", "Noto Serif SC", serif'
    },
    {
      key: "kaiti-soft",
      label: "楷体标题",
      stack: '"Kaiti SC", "STKaiti", "KaiTi", serif'
    },
    {
      key: "rounded-display",
      label: "圆润标题",
      stack: '"ZCOOL KuaiLe", "PingFang SC", "Microsoft YaHei", sans-serif'
    },
    {
      key: "source-serif",
      label: "思源宋体",
      stack: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", serif'
    },
    {
      key: "modern-display",
      label: "现代标题",
      stack: '"Inter", "PingFang SC", "Microsoft YaHei", sans-serif'
    }
  ],
  romance: [
    {
      key: "wenkai",
      label: "霞鹜文楷",
      stack: '"LXGW WenKai Screen", "LXGW WenKai", "STKaiti", cursive'
    },
    {
      key: "ma-shan-zheng",
      label: "马善政",
      stack: '"Ma Shan Zheng", "STKaiti", cursive'
    },
    {
      key: "zcool-xiaowei",
      label: "站酷小薇",
      stack: '"ZCOOL XiaoWei", "STKaiti", serif'
    },
    {
      key: "kaiti",
      label: "系统楷体",
      stack: '"Kaiti SC", "STKaiti", "KaiTi", cursive'
    },
    {
      key: "serif-romance",
      label: "文艺宋体",
      stack: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
    },
    {
      key: "soft-hand",
      label: "轻手写感",
      stack: '"Yuji Syuku", "STKaiti", "Kaiti SC", cursive'
    }
  ],
  number: [
    {
      key: "mono-classic",
      label: "经典等宽",
      stack: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
    },
    {
      key: "mono-modern",
      label: "现代等宽",
      stack: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace'
    },
    {
      key: "mono-soft",
      label: "柔和等宽",
      stack: '"Roboto Mono", "SFMono-Regular", Consolas, monospace'
    },
    {
      key: "tabular-system",
      label: "系统数字",
      stack: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif'
    }
  ]
};

export function getFontOptionGroups() {
  return fontOptionGroups;
}

export function normalizeFontKey(role: FontRole, key: string | null | undefined) {
  const defaultKey = FONT_ROLE_DEFAULTS[role];

  return fontOptionGroups[role].some((option) => option.key === key) ? key : defaultKey;
}

export function getFontStack(role: FontRole, key: string | null | undefined) {
  const normalizedKey = normalizeFontKey(role, key);
  const option = fontOptionGroups[role].find((item) => item.key === normalizedKey);

  return option?.stack ?? fontOptionGroups[role][0].stack;
}

export function resolveThemeFontStacks(theme: {
  bodyFontKey?: string | null;
  displayFontKey?: string | null;
  romanceFontKey?: string | null;
  numberFontKey?: string | null;
}) {
  return {
    body: getFontStack("body", theme.bodyFontKey),
    display: getFontStack("display", theme.displayFontKey),
    romance: getFontStack("romance", theme.romanceFontKey),
    number: getFontStack("number", theme.numberFontKey)
  };
}
