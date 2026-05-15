import { expect, test } from "@playwright/test";

test("public home renders seeded site", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Like Zhizhi" })).toBeVisible();
  await expect(page.getByText("把每一天都认真收藏")).toBeVisible();
  await expect(page.getByText("最新点滴")).toBeVisible();
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
