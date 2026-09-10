# Wave 4A Final Regression Report (Agent 7, i18n-qa)

> Branch under test: `i18n/w1-integration` at `d86563017a` (includes Wave 1-3 results
> and the Wave 3 fix round: D-1/D-2/D-3 via `c154994439`, D-2/D-7/D-5 via `d8fdf92d37`,
> D-4 via `f9633ee1fa`).
> Role: read-only full regression (TEST_TOOLS.md T-10). Defects are reported, not fixed.

## 1. Tool gates (full v1 scope)

Scope: usage / cost-tracking / cost-optimization / budgets / models-and-endpoints /
api-keys / global shell.

### 1.1 check-keys (en/zh key set, shape, interpolation)

```
cd ui/litellm-dashboard && node scripts/i18n/check-keys.mjs
```

All 8 namespaces (apiKeys, auth, budgets, common, cost, models, navigation, usage)
report `key set matched (0 missing / 0 shape / 0 interpolation)`, exit 0. **PASS**.

### 1.2 check-keys-dangling

```
node scripts/i18n/check-keys-dangling.mjs "src/app/(dashboard)/usage" \
  "src/app/(dashboard)/cost-tracking" "src/app/(dashboard)/cost-optimization" \
  "src/app/(dashboard)/budgets" "src/app/(dashboard)/models-and-endpoints" \
  "src/app/(dashboard)/api-keys"
node scripts/i18n/check-keys-dangling.mjs "src"
```

Both runs exit 0 (WARN only, dynamic keys). Remaining warnings are the same dynamic
references already resolved in Wave 3 (ternary keys, `REMOVAL_KINDS[kind]`,
`option.labelKey`, `b.label`, `VIEW_MODE_LABEL_KEYS[viewMode]`, `TAB_LABEL_KEYS[slug]`,
`labelText(item)`, `group.groupLabel`). Spot re-resolution of the new-in-scope entries
(`VIEW_MODE_LABEL_KEYS.*`, `TAB_LABEL_KEYS.*`) against `en/` + `zh-CN/models.json`
shows all referenced keys exist in both locales. **PASS**, no new human follow-up.

### 1.3 scan-hardcoded (v1 scope)

```
node scripts/i18n/scan-hardcoded.mjs "src/app/(dashboard)/usage" \
  "src/app/(dashboard)/cost-tracking" "src/app/(dashboard)/cost-optimization" \
  "src/app/(dashboard)/budgets" "src/app/(dashboard)/models-and-endpoints" \
  "src/app/(dashboard)/api-keys"
```

23 hits (Wave 3 scope alone was 17; the wider v1 scope adds 6):

- 17 hits in the four Wave 3 areas: unchanged from the W3 audit — scanner artifacts on
  TS expression fragments (13, all false positives) plus 4 English test markers in
  `EntityUsage.test.tsx` ("Activity Metrics", "Top Keys", "Top Models", "Usage Export
  Header") that document the still-open shared-component gap (D-6).
- 6 new hits from models-and-endpoints/api-keys, audited item by item:
  - `api-keys/ApiKeysDashboard.test.tsx:40` (`aria-label "Virtual Keys"`), `:46`
    (`"Create Key"`) — English strings inside a test file, test fixtures, not shipped
    UI. False-positive class (test marker).
  - `models-and-endpoints/components/AccessGroupBudgetColumns.tsx:21`,
    `AllModelsTable.tsx:75`, `ModelsTableColumns.tsx:259/356`,
    `costOptimizationUtils.ts`-style fragments (`"0 && maxBudget"`, `"void | Promise"`)
    — JSX-lookalike TS expression fragments rendered by the scanner. False positives.

No user-facing hardcoded copy found in v1-scope owned files. **PASS** (report-only).

## 2. Targeted vitest regression (explicit paths only)

Wave 3 areas (all four directories, 52 test files):

```
npx vitest run "src/app/(dashboard)/usage" "src/app/(dashboard)/cost-tracking" \
  "src/app/(dashboard)/cost-optimization" "src/app/(dashboard)/budgets"
```

650 tests passed, 0 failed, "Type Errors: no errors", exit 0.

Wave 1/2 areas + platform (23 test files):

```
npx vitest run src/i18n "src/app/(dashboard)/models-and-endpoints" \
  "src/app/(dashboard)/api-keys" src/components/VirtualKeysPage \
  src/components/language_switcher
```

282 tests passed, 0 failed, "Type Errors: no errors", exit 0.

**Total: 75 test files, 932 tests, 932 passed, 100% pass rate.**

### 2.1 Verification of fixed defects D-1 / D-2 / D-3 / D-7

| Defect | Expected behavior after fix | Evidence in this run |
|---|---|---|
| D-1 (budgets duration cell, P1) | Budget table "Reset Period" cell renders zh duration labels | `BudgetTableColumns.tsx:43` now routes through `budgets:table.filters.duration.*` (`DURATION_LABEL_KEYS.has(value) ? t(\`budgets:table.filters.duration.${value}\`) : value`); zh dictionary carries 每小时/每天/每周/每月. Budgets + models-and-endpoints suites (which cover the table) all pass. |
| D-2 (EntityUsage raw English entity type, P1) | `{{entity}}` interpolated from localized nouns | `EntityUsage.tsx:43` `entityNoun` resolves `usage:entity.type.*`; zh has 团队/用户/组织/客户/标签/Agent/密钥; filter label uses `filterBy` "按{{entity}}筛选". Usage suite (incl. EntityUsage tests) passes. |
| D-3 (models page duration leak, P1) | AccessGroup budget column localized | `AccessGroupBudgetColumns.tsx:159` uses shared `localizedBudgetDurationLabel(t, ...)` (same helper as budgets). models-and-endpoints suite passes. |
| D-7 (half-width punctuation / 加价 wording, P2) | Full-width ellipsis/parens, glossary term 加价 | `zh-CN/cost.json` and `usage.json` normalized in `d8fdf92d37` (加载中… style); spot grep shows no remaining half-width `...` in the flagged keys. |

## 3. Engineering gates (vs Wave 3 baseline)

| Gate | Wave 3 baseline | Wave 4A now | Trend |
|---|---|---|---|
| `npm run build` | PASS, 51 static routes | PASS, 51/51 static pages, exit 0 | 持平 (green) |
| `npm run lint` | FAIL: 1 error, 3421 warnings | PASS: **0 errors**, 3421 warnings | **改善** (D-4 fixed the prefer-find-by error; warning count unchanged) |
| `npm run format:check` | FAIL: 290 files | FAIL: 258 files | **改善** (Wave 3 offenders fixed by D-5 prettier pass; remaining 258 are pre-Wave-3 legacy) |
| `npm run test:types` | not run in W3 | PASS (4 files, no type errors) | 改善 (now measured) |

`test:types` exists in package.json and passes; it runs the vitest typecheck pipeline.

## 4. Known gaps (verified current status)

| ID | Status | Evidence |
|---|---|---|
| D-6 (shared components render English on /usage) | **Still open** | `src/components/activity_metrics.tsx`, `src/components/shared/SavingsTiles.tsx`, `src/components/EntityUsageExport/UsageExportHeader.tsx`, `src/components/UsagePage/components/EntityUsage/TopKeyView.tsx` contain no `useTranslation`/`useI18n`; the 4 English test markers in `EntityUsage.test.tsx` still assert that English output. P2, non-blocking for G4 per Wave 3 verdict. |
| D-8 (E2E locale assertions) | **Still open** | `tests/e2e/ui/` has full Playwright infrastructure (playwright.config.ts, globalSetup, specs for usage/budgets/navigation/models) but zero i18n/locale specs (no locale/language/LanguageSwitcher references). T-01 i18n smoke remains unlanded. |

No new infrastructure was built this round, per instructions.

## 5. Language switch end-to-end chain (static review, ADR-04/ADR-05)

Chain: `src/app/layout.tsx` wraps the tree in `<I18nProvider>` (line 31) inside
`<html lang="en" suppressHydrationWarning>`; `src/components/LanguageSwitcher/LanguageSwitcher.tsx`
consumes `useI18n().setLocale`. Verified:

1. **Readiness gate (ADR-03/04)**: `I18nProvider.tsx` resolves the locale via
   `resolveLocale(createBrowserLocaleEnv())`, awaits `getI18n()` + `changeLanguage(target)`,
   and returns `null` until `ready && i18n`. No `t()`/`<Trans>` content renders before
   resources are ready, for both en and zh — no raw-key flash on first frame.
2. **`<html lang>` sync**: set to `instance.language` post-init (line 54) and again on
   every `setLocale` (line 80). Static export still ships `lang="en"` at build time;
   runtime sync is client-side post-mount, consistent with the documented ADR-04
   static-export constraint.
3. **Preference persistence**: single unified key `litellm.locale`
   (`localePreferences.ts:8`, DECISIONS P5). Write path is
   `writeLocalePreference(next, env)` → cookie `litellm.locale=<locale>; SameSite=Lax; path=/`
   (+ `Secure` on HTTPS) plus localStorage, with best-effort try/catch for private mode.
   Read path `resolveLocale` follows the D5 chain (explicit preference → cookie →
   localStorage → navigator languages → en). Tests cover both storage surfaces
   (`localePreferences.test.ts:77-138`, `I18nProvider.integration.test.tsx:70/109`).
4. **Refresh persistence / full-page navigation**: because the preference lives in a
   cookie (readable on any server round-trip and by the provider at boot), refresh and
   full-page jumps (Login/SSO/MCP OAuth) resolve to the saved locale; TC-04/16-19 logic
   is satisfied at unit/integration level. No E2E assertion exists yet (D-8).

No structural regressions found in the chain after Wave 2/3 integration.

## 6. Regression matrix status (B1-B10, evidence-backed)

| Area | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8 | B9 | B10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Shell (Navbar/Leftnav/user menu) | ✅(unit) | ✅(unit) | ✅(unit) | ✅(unit) | ✅(unit) | ➖ | ✅(unit) | (m) | ➖ | ➖ |
| LanguageSwitcher | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ✅(unit) |
| Models and Endpoints | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | (m) | ✅ | ➖ |
| API Keys | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | (m) | ✅ | ➖ |
| Usage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | (m) | ✅ | ➖ |
| Cost Tracking | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | (m) | ✅ | ➖ |
| Cost Optimization | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | (m) | ✅ | ➖ |
| Budgets | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | (m) | ✅ | ➖ |

✅ = covered by the 932 passing tests (unit/component/integration through the real
dictionary). (m) = Chinese narrow-viewport visual walkthrough remains manual (Agent 2
walkthrough list in W3 report §5 still applies; no automated overflow assertions
landed). B10 full-page-jump is unit-verified only; E2E pending D-8. Platform-layer rows
(default en, `<html lang>`, refresh, fallback, no raw key, key parity, title English)
are covered by the src/i18n suite (282-test batch) and check-keys; the static-output
`out/` scan (TC-22/26) was not re-run because it requires a build artifact consumer
that remains unlanded (T-07 partial).

## 7. Remaining defects (delta vs Wave 3)

No new defects found in this round. All Wave 3 P1s are fixed and verified (section 2.1).

| Level | Count | Items |
|---|---|---|
| P0 | 0 | none |
| P1 | 0 | D-1/D-2/D-3 fixed and verified |
| P2 (carried over) | 2 | D-6 shared components English on /usage (open); D-8 no E2E locale assertions (open) |
| P2 (gate hygiene) | 1 | format:check still red on 258 pre-Wave-3 legacy files (baseline predates the i18n project; requires an Agent 0 policy call, not an i18n-wave fix) |

## 8. G4 quality conclusion (v1 definition of done, test-related items)

| DoD item (plan §11) | Status |
|---|---|
| (1) en/zh dual language supported | PASS (check-keys 8/8 namespaces, 932 tests) |
| (2) Instant switch + refresh persistence | PASS at unit/integration level; E2E assertion missing (D-8) |
| (3) v1 pages localized | PASS (scan-hardcoded: no user-facing hardcoded copy in v1 scope; D-6 shared-component leak is the documented P2 exception on /usage) |
| (4) Fallback to English, no raw keys | PASS (readiness gate + fallback tests in src/i18n suite) |
| (5) No severe truncation/overlap in zh | PARTIAL — no automated assertions; manual walkthrough outstanding (Agent 2) |
| (6) Switch does not clear forms / no anomalous requests | PASS (integration tests) |
| (7) Full-page navigation keeps language | PASS logically (cookie-based chain); E2E pending (D-8) |
| (8) `<title>`/meta English at build | PASS (build green; static output scan not re-run this round) |
| (9) Model names/API fields not mistranslated | PASS (B6 tests, dictionary spot checks) |
| (10) Related tests pass | PASS (932/932, 0 type errors) |
| (11) lint / format / build | lint PASS (0 errors), build PASS, format:check FAIL (258 legacy files, pre-existing) |

**Verdict: functional quality is G4-ready on the i18n work itself.** Every P0/P1 from
Wave 1-3 is closed and re-verified; all gates that the i18n project can own are green.
Two P2s remain open by design (D-6 shared components, D-8 E2E locale specs) and one
gate (format:check) is red only on pre-project legacy files. G4 sign-off recommendation:
close or explicitly waive D-6/D-8, obtain Agent 2's zh visual walkthrough for item (5),
and get an Agent 0 ruling on the legacy prettier baseline.

## 9. D-8 landed this round: E2E locale smoke (T-01 minimal, A0 ruling)

New spec: `tests/e2e/ui/tests/i18n/localeSmoke.spec.ts` (4 tests, chromium project).
Collect + types verified: `npx playwright test --list tests/i18n/localeSmoke.spec.ts`
reports "Total: 4 tests in 1 file"; `npx tsc --noEmit` over the suite exits 0.

Coverage:

1. Default boot is en: `<html lang>` matches `/^en(\b|-|$)/`, leftnav shows "Usage",
   no raw keys.
2. `litellm.locale=zh-CN` boot (localStorage + cookie, the D5 chain read by
   I18nProvider): readiness gate resolves zh before render, `<html lang>` becomes
   exactly `zh-CN`, leftnav shows the real dictionary labels 用量, and no raw key
   leaks into visible text.
3. Raw-key scan (`/(?:^|[\s"'`>(])(usage|cost|budgets|common|models|apiKeys|auth|navigation):[A-Za-z][A-Za-z0-9_.]*/`)
   over the three v1 pages (`?page=new_usage`, `?page=budgets`, `?page=models`) in
   zh-CN — any visible `namespace:segment` string fails with the key named.
4. Reload persistence: full `page.reload()` keeps `<html lang="zh-CN">`, the zh
   Budgets label stays visible, and `localStorage["litellm.locale"]` stays `zh-CN`.

### Runtime prerequisites (execution is a user walkthrough item)

The suite targets a live proxy (it cannot run against a bare static export because the
pages require an authenticated proxy session):

- Prereqs: seeded e2e proxy per `tests/e2e/ui/run_e2e.sh` (seed.sql users, master key).
  Minimal form: `LITELLM_MASTER_KEY=sk-1234 litellm --config <config.yml> --port 4000`,
  `SERVER_ROOT_PATH` default empty, base URL from `E2E_UI_BASE_URL`/`LITELLM_PROXY_URL`
  (default `http://localhost:4000`). globalSetup seeds users/storage states
  (`ADMIN_STORAGE_PATH`) and needs the master key via `LITELLM_MASTER_KEY`.
- Run: `cd tests/e2e/ui && npx playwright test tests/i18n/localeSmoke.spec.ts`
  (deps via `npm ci` in that directory; `@playwright/test` 1.58.1 per its own
  package-lock).
- "Actually executed against a live proxy" is deliberately left as a user walkthrough
  item; no product code was modified to make the suite runnable.

### New defect found while writing the spec

| ID | Level | Where | What |
|---|---|---|---|
| D-9 | P1 | `src/components/LanguageSwitcher/LanguageSwitcher.tsx` | The switcher is exported and tested but **never mounted** — `rg LanguageSwitcher src` finds no importer outside the component itself. A user cannot switch language from any UI surface; only the storage chain works. The smoke spec therefore drives zh via the persisted-preference boot path. When the switcher is mounted, add a UI click-through E2E ("简体中文" button) to cover TC-03. |

This updates the D-8 item: the missing E2E locale assertions now exist; D-8 can be
closed pending the live-run walkthrough, and D-9 is the remaining blocker for
"switch is reachable by end users" (DoD item 2's switch half).
