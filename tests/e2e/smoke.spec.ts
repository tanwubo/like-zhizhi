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
