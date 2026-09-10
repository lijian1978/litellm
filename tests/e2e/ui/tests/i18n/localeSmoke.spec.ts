import { test, expect, type Page as PlaywrightPage } from "@playwright/test";
import { ADMIN_STORAGE_PATH } from "../../constants";
import { Page } from "../../fixtures/pages";
import { navigateToPage, dismissFeedbackPopup } from "../../helpers/navigation";

/**
 * i18n locale smoke (TEST_TOOLS.md T-01, defect D-8).
 *
 * What this covers, against the Wave 4 regression matrix platform rows:
 *  - B1 default language is en and `<html lang>` reflects it.
 *  - B3 a `litellm.locale` preference (localStorage + cookie, the D5 chain read by
 *    I18nProvider) resolves to zh-CN on boot, syncs `<html lang>`, and survives reload.
 *  - B4/TC-07 no raw i18n key (e.g. "usage:entity.spendOverview") leaks into visible
 *    text on v1 pages.
 *  - Localized nav labels render in zh (leftnav 用量/预算) so the assertion is on real
 *    dictionary output, not just the lang attribute.
 *
 * NOTE: the switch is driven through the persisted-preference boot path rather than a
 * UI click, because the LanguageSwitcher component is not mounted anywhere in the app
 * yet (reported as a defect; see W4_A7_FINAL_REPORT.md). When it is mounted, add a
 * click-through test on the "简体中文" button.
 */

/** A raw t() key rendered as text: "namespace:segment..." for any v1 namespace. */
const RAW_KEY_PATTERN = /(?:^|[\s"'`>(])((?:usage|cost|budgets|common|models|apiKeys|auth|navigation):[A-Za-z][A-Za-z0-9_.]*)/;

/** Leftnav labels that come straight from `navigation.json` in each locale. */
const NAV = {
  usage: { en: "Usage", zh: "用量" },
  budgets: { en: "Budgets", zh: "预算" },
} as const;

test.use({ storageState: ADMIN_STORAGE_PATH });

async function visibleText(page: PlaywrightPage): Promise<string> {
  await dismissFeedbackPopup(page);
  return page.locator("body").innerText();
}

async function expectNoRawKeys(page: PlaywrightPage, where: string): Promise<void> {
  const text = await visibleText(page);
  const match = text.match(RAW_KEY_PATTERN);
  expect(
    match,
    `${where} leaked a raw i18n key into visible text${match ? `: "${match[1]}"` : ""}`,
  ).toBeNull();
}

test.describe("i18n locale smoke", () => {
  test("default language is en with <html lang=en> and localized nav labels", async ({ page }) => {
    await navigateToPage(page, Page.NewUsage);
    await expect(page.locator("html")).toHaveAttribute("lang", /^en(\b|-|$)/);
    await expect(page.getByRole("link", { name: NAV.usage.en })).toBeVisible();
    await expectNoRawKeys(page, "/ui (default en)");
  });

  test("litellm.locale=zh-CN boot: <html lang>, zh nav labels, no raw keys", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("litellm.locale", "zh-CN");
      document.cookie = "litellm.locale=zh-CN; SameSite=Lax; path=/";
    });
    await navigateToPage(page, Page.NewUsage);

    // The readiness gate must resolve the stored preference before rendering.
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("link", { name: NAV.usage.zh })).toBeVisible();
    await expectNoRawKeys(page, "/usage in zh-CN");
  });

  test("raw-key scan over v1 pages (usage, budgets, models) in zh-CN", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("litellm.locale", "zh-CN");
      document.cookie = "litellm.locale=zh-CN; SameSite=Lax; path=/";
    });

    for (const target of [Page.NewUsage, Page.Budgets, Page.Models] as const) {
      await navigateToPage(page, target);
      await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
      await expectNoRawKeys(page, `/ui?page=${target} in zh-CN`);
    }
  });

  test("locale survives reload (persistence across full page navigation)", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("litellm.locale", "zh-CN");
      document.cookie = "litellm.locale=zh-CN; SameSite=Lax; path=/";
    });
    await navigateToPage(page, Page.Budgets);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");

    // Full reload: the provider must re-resolve zh-CN from storage, not reset to en.
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("link", { name: NAV.budgets.zh })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("litellm.locale")))
      .toBe("zh-CN");
  });
});
