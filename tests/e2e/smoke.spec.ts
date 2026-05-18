import { expect, test } from "@playwright/test";

test("public home renders seeded site", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Like Zhizhi" })).toBeVisible();
  await expect(page.getByText("把每一天都认真收藏")).toBeVisible();
  await expect(page.getByRole("heading", { name: "点滴", exact: true })).toBeVisible();
});

test("public module routes render", async ({ page }) => {
  const routes = [
    ["/notes", "点滴"],
    ["/messages", "留言"],
    ["/footprints", "轨迹"],
    ["/album", "相册"],
    ["/checklist", "清单"],
    ["/love-days", "纪念日"],
    ["/about", "关于"]
  ] as const;

  for (const [route, heading] of routes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
});

test("public pages render representative seed content", async ({ page }) => {
  const expectations = [
    ["/notes", "第一条点滴"],
    ["/messages", "祝你们一直热爱生活。"],
    ["/checklist", "一起看一次海"],
    ["/love-days", "在一起"],
    ["/album", "海边日落"],
    ["/footprints", "外滩"]
  ] as const;

  for (const [route, text] of expectations) {
    await page.goto(route);
    await expect(page.getByText(text)).toBeVisible();
  }

  await page.goto("/album");
  await expect(page.getByRole("img", { name: "海边日落" })).toBeVisible();
});

test("visitor can submit a pending message", async ({ page }) => {
  await page.goto("/messages");
  await page.getByLabel("昵称").fill("端到端访客");
  await page.getByLabel("留言").fill("这是一条端到端提交的留言，等待审核后展示。");
  await page.getByRole("button", { name: "提交留言" }).click();
  await expect(page.getByText("留言已提交，审核通过后会展示在留言墙。")).toBeVisible();
});

test("login page renders seed account hint", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "后台登录" })).toBeVisible();
  await expect(page.getByText("owner@example.com / ChangeMe123!")).toBeVisible();
});

test("seed owner can login to admin dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "管理概览" })).toBeVisible();
});

test("seed owner sees analytics cards on admin dashboard", async ({ page }) => {
  await page.goto("/");
  await page.goto("/notes");
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("访问量")).toBeVisible();
  await expect(page.getByText("独立访客")).toBeVisible();
});

test("admin delete confirmation asks before submitting", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/content/notes");
  await expect(page.getByRole("heading", { name: "点滴管理" })).toBeVisible();

  page.on("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("确认删除");
    await dialog.dismiss();
  });

  await page.getByRole("button", { name: "删除" }).first().click();
  await expect(page).toHaveURL(/\/admin\/content\/notes$/);
});

test("seed owner can open message moderation", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/content/messages");
  await expect(page.getByRole("heading", { name: "留言审核" })).toBeVisible();
  await expect(page.getByRole("button", { name: /通过|隐藏/ }).first()).toBeVisible();
});

test("seed owner can create an admin note draft", async ({ page }) => {
  const suffix = Date.now().toString();
  const title = `端到端点滴 ${suffix}`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/content/notes");
  await expect(page.getByRole("heading", { name: "点滴管理" })).toBeVisible();
  await page.getByRole("link", { name: "新建点滴" }).click();
  await page.getByLabel("标题").fill(title);
  await page.getByLabel("摘要").fill("这是一条端到端创建的点滴摘要。");
  await page.getByLabel("正文").fill("这是一条端到端创建的点滴正文，用来验证后台点滴管理流程。");
  await page.getByRole("button", { name: "保存点滴" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/notes$/);
  await expect(page.getByText(title)).toBeVisible();
});

test("seed owner can create an admin album draft", async ({ page }) => {
  const suffix = Date.now().toString();
  const title = `端到端相册 ${suffix}`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/content/album");
  await expect(page.getByRole("heading", { name: "相册管理" })).toBeVisible();
  await page.getByRole("link", { name: "新建相册" }).click();
  await page.getByLabel("标题").fill(title);
  await page.getByLabel("媒体地址").fill("https://example.com/e2e-album.jpg");
  await page.getByLabel("说明").fill("这是一条端到端创建的相册草稿。");
  await page.getByRole("button", { name: "保存相册" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/album$/);
  await expect(page.getByText(title)).toBeVisible();
});

test("seed owner can create an admin checklist draft", async ({ page }) => {
  const suffix = Date.now().toString();
  const title = `端到端清单 ${suffix}`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/content/checklist");
  await expect(page.getByRole("heading", { name: "清单管理" })).toBeVisible();
  await page.getByRole("link", { name: "新建清单" }).click();
  await page.getByLabel("标题").fill(title);
  await page.getByLabel("说明").fill("这是一条端到端创建的清单草稿。");
  await page.getByRole("button", { name: "保存清单" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/checklist$/);
  await expect(page.getByText(title)).toBeVisible();
});

test("seed owner can create an admin footprint place", async ({ page }) => {
  const suffix = Date.now().toString();
  const name = `端到端足迹 ${suffix}`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/content/footprints");
  await expect(page.getByRole("heading", { name: "足迹管理" })).toBeVisible();
  await page.getByRole("link", { name: "新建足迹" }).click();
  await page.getByLabel("地点名称").fill(name);
  await page.getByLabel("地点说明").fill("这是一条端到端创建的足迹地点。");
  await page.getByLabel("纬度").fill("31.2397");
  await page.getByLabel("经度").fill("121.4998");
  await page.getByLabel("访问标题").fill("第一次记录");
  await page.getByLabel("访问说明").fill("用来验证足迹访问记录。");
  await page.getByLabel("访问日期").fill("2026-05-15");
  await page.getByRole("button", { name: "保存足迹" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/footprints$/);
  await expect(page.getByText(name)).toBeVisible();
});

test("seed owner can create an admin love-day event", async ({ page }) => {
  const suffix = Date.now().toString();
  const title = `端到端纪念日 ${suffix}`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/content/love-days");
  await expect(page.getByRole("heading", { name: "纪念日管理" })).toBeVisible();
  await page.getByRole("link", { name: "新建纪念日" }).click();
  await page.getByLabel("标题").fill(title);
  await page.getByLabel("说明").fill("这是一条端到端创建的纪念日。");
  await page.getByLabel("日期").fill("2026-05-16");
  await page.getByRole("button", { name: "保存纪念日" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/love-days$/);
  await expect(page.getByText(title)).toBeVisible();
});

test("seed owner can create an admin music track", async ({ page }) => {
  const suffix = Date.now().toString();
  const title = `端到端音乐 ${suffix}`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/content/music");
  await expect(page.getByRole("heading", { name: "音乐管理" })).toBeVisible();
  await page.getByRole("link", { name: "新建音乐" }).click();
  await page.getByLabel("标题").fill(title);
  await page.getByLabel("歌手").fill("端到端歌手");
  await page.getByLabel("音频地址").fill("https://example.com/e2e-song.mp3");
  await page.getByRole("button", { name: "保存音乐" }).click();
  await expect(page).toHaveURL(/\/admin\/content\/music$/);
  await expect(page.getByText(title)).toBeVisible();
});

test("seed owner can update theme settings", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/settings/theme");
  await expect(page.getByRole("heading", { name: "主题设置" })).toBeVisible();
  await page.getByLabel("主色").fill("#2f80ed");
  await page.getByLabel("背景图片地址").fill("https://example.com/theme-bg.jpg");
  await page.getByLabel("背景视频地址").fill("");
  await page.getByLabel("玻璃效果").check();
  await page.getByLabel("页面动效").check();
  await page.getByRole("button", { name: "保存主题设置" }).click();

  await expect(page).toHaveURL(/\/admin\/settings\/theme$/);
  await expect(page.getByLabel("主色")).toHaveValue("#2f80ed");
});

test("seed owner can register media in admin media center", async ({ page }) => {
  const suffix = Date.now().toString();
  const mediaUrl = `https://example.com/e2e-media-${suffix}.jpg`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/media");
  await expect(page.getByRole("heading", { name: "媒体中心" })).toBeVisible();
  await page.getByLabel("外部媒体地址").fill(mediaUrl);
  await page.getByRole("button", { name: "登记外部媒体" }).click();
  await expect(page).toHaveURL(/\/admin\/media$/);
  await expect(page.getByRole("link", { name: `e2e-media-${suffix}.jpg` })).toBeVisible();
});

test("seed owner can save integration settings", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/integrations");
  await expect(page.getByRole("heading", { name: "集成配置" })).toBeVisible();
  await page.getByLabel("启用地图服务").check();
  await page.getByLabel("地图服务商").selectOption("amap");
  await page.getByLabel("地图服务 URL").fill("https://restapi.amap.com");
  await page.getByLabel("地图公开 Key").fill("e2e-public-map-key");
  await page.getByLabel("启用天气服务").check();
  await page.getByLabel("天气服务商").selectOption("openweather");
  await page.getByLabel("天气服务 URL").fill("https://api.openweathermap.org");
  await page.getByLabel("启用邮件通知").check();
  await page.getByLabel("邮件服务商").selectOption("smtp");
  await page.getByLabel("SMTP 主机").fill("smtp.example.com");
  await page.getByLabel("SMTP 端口").fill("465");
  await page.getByLabel("发件邮箱").fill("hello@example.com");
  await page.getByRole("button", { name: "保存集成配置" }).click();

  await expect(page).toHaveURL(/\/admin\/integrations$/);
  await expect(page.getByText("配置已保存")).toBeVisible();
  await expect(page.getByLabel("地图服务 URL")).toHaveValue("https://restapi.amap.com");
});

test("seed owner can create a moderator", async ({ page }) => {
  const suffix = Date.now().toString();
  const email = `moderator-${suffix}@example.com`;
  const name = `端到端管理员 ${suffix}`;

  await page.goto("/login");
  await page.getByLabel("邮箱").fill("owner@example.com");
  await page.getByLabel("密码").fill("ChangeMe123!");
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "用户管理" })).toBeVisible();
  await page.getByRole("link", { name: "新建用户" }).click();
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("显示名称").fill(name);
  await page.getByLabel("角色").selectOption("MODERATOR");
  await page.getByLabel("登录密码").fill("Secret123!");
  await page.getByRole("button", { name: "保存用户" }).click();

  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(page.getByText(name)).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
});
