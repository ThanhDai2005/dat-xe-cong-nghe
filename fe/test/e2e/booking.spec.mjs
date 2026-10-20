import { test, expect } from "@playwright/test";
import { actor, sql } from "../../../be/test/e2e/booking-helpers.mjs";

test.afterAll(() => sql.end());
test("TASK-86 UI: login, server quote, create once, reload detail, cancel and find history", async ({ page }) => {
  const customer = await actor();
  const [users] = await sql.execute("SELECT phone FROM users WHERE id = ?", [customer.id]);
  await page.goto("/booking");
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await page.getByPlaceholder("Nhập email hoặc số điện thoại").fill(users[0].phone);
  await page.getByPlaceholder("Nhập mật khẩu").fill("BookingTest123!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tạo yêu cầu đặt xe" })).toBeVisible();
  for (const [label, address, lat, lng] of [["điểm đón", "Hà Nội kiểm thử", "21.03", "105.85"], ["điểm đến", "Bắc Ninh kiểm thử", "21.1", "106.1"]]) {
    await page.getByLabel(`Địa chỉ ${label}`, { exact: true }).fill(address);
    await page.getByLabel(`Vĩ độ ${label}`, { exact: true }).fill(lat);
    await page.getByLabel(`Kinh độ ${label}`, { exact: true }).fill(lng);
  }
  const departure = new Date(Date.now() + 8 * 3600000);
  const localTime = new Date(departure.getTime() - departure.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  await page.getByLabel("Giờ khởi hành (giờ địa phương)").fill(localTime);
  await page.getByLabel("Số khách").selectOption("2");
  await page.getByRole("button", { name: "Lấy báo giá", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Xác nhận yêu cầu" })).toBeVisible();
  await expect(page.getByText(/BÁO GIÁ GIẢ LẬP LOCAL/)).toBeVisible();
  await expect(page.getByText("Tiền mặt làm tròn: 100.000 ₫", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận đặt xe", exact: true }).click();
  await expect(page).toHaveURL(/\/booking\/success\/\d+$/);
  const id = page.url().split("/").at(-1);
  await page.reload();
  await expect(page.getByRole("heading", { name: new RegExp(`#${id} · Đang tìm tài xế`) })).toBeVisible();
  await page.getByLabel("Lý do hủy").fill("Kiểm thử hủy yêu cầu trên trình duyệt");
  await page.getByRole("button", { name: "Hủy yêu cầu", exact: true }).click();
  await expect(page.getByRole("heading", { name: new RegExp(`#${id} · Đã hủy`) })).toBeVisible();
  await page.goto("/trips");
  await page.getByLabel("Trạng thái").selectOption("CLOSE");
  await expect(page.getByRole("link", { name: new RegExp(`#${id} · Đã hủy`) })).toBeVisible();
  const [rows] = await sql.execute("SELECT id, status FROM booking_requests WHERE customer_user_id = ?", [customer.id]);
  expect(rows).toHaveLength(1);
  expect(rows[0].status).toBe("CLOSE");
});
test("TASK-86 UI: direct confirmation has no fabricated success or quote", async ({ page }) => {
  const customer = await actor();
  await page.goto("/");
  await page.evaluate(({ id, token }) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify({ id, role: "CUSTOMER", fullName: "Test", phone: "", email: "", status: "ACTIVE" }));
  }, customer);
  await page.goto("/booking/confirm");
  await expect(page.getByRole("heading", { name: "Chưa có báo giá" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Xác nhận đặt xe" })).toHaveCount(0);
});
