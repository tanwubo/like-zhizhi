import { expect, test } from "@playwright/test";

test("public home renders seeded site", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Like Zhizhi" })).toBeVisible();
  await expect(page.getByText("把每一天都认真收藏")).toBeVisible();
  await expect(page.getByText("最新点滴")).toBeVisible();
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
