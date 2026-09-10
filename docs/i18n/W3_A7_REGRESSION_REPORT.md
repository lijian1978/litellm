# Wave 3 Regression Report (Agent 7, i18n-qa)

> Branch under test: `i18n/w1-integration` at `19ef574fcc`
> Role: read-only regression. Defects are reported, not fixed.
> Scope: Wave 3 new areas (usage, cost-tracking, cost-optimization, budgets) plus
> spot-check regression on Wave 1/2 areas (shell/auth/nav, models, apiKeys).

## 1. Tool gates

### 1.1 check-keys (en/zh key set, shape, interpolation)

```
cd ui/litellm-dashboard && node scripts/i18n/check-keys.mjs
```

All 8 namespaces (apiKeys, auth, budgets, common, cost, models, navigation, usage)
report `key set matched (0 missing / 0 shape / 0 interpolation)`, exit 0. PASS.

### 1.2 check-keys-dangling (component references vs dictionary)

```
node scripts/i18n/check-keys-dangling.mjs "src/app/(dashboard)/usage" .../cost-tracking .../cost-optimization .../budgets
node scripts/i18n/check-keys-dangling.mjs "src"
```

No dangling keys in either run (exit 0). 17 dynamic-key warnings in Wave 3 files
(ternaries, `REMOVAL_KINDS[kind].title`, `option.labelKey`, `b.label` from
`autoRouterBenchmarks.ts`). I resolved every one against `en/cost.json` and
`zh-CN/cost.json` programmatically: all 23 distinct referenced keys exist in both
locales (pricingCalculator.requestsPerDay/Monthly, calculator.daily/monthly,
cacheLeakage.models/keys/noModelUsage/noKeyUsage, shadowEval.judgedSummary(Budget),
shadowEval.status.*, remove.*, autoRouter.buckets.*). PASS; no human follow-up left
from the WARN list.

### 1.3 scan-hardcoded (v1 scope) and A6A misclassification audit

```
node scripts/i18n/scan-hardcoded.mjs "src/app/(dashboard)/usage" .../cost-tracking .../cost-optimization .../budgets
```

17 hits, matching the A6A report exactly. Item-by-item audit of A6A's claim that
all are false positives or test markers:

- 13 hits are scanner artifacts on TypeScript expression fragments rendered as JSX
  lookalikes (`>= 0 && percentValue` in ShadowEvalStartForm.tsx:222/224/227,
  provider_discount_table.tsx:38, provider_margin_table.tsx:55, use_discount_config.ts:134;
  generic fragments in costOptimizationUtils.ts:9/222, multi_export_utils.test.ts:17/79,
  gatewayActivity.ts:54, usePaginatedDailyActivity.ts:90). Confirmed false positives.
- 4 hits are English marker strings in `usage/_components/components/EntityUsage/EntityUsage.test.tsx`
  (lines 35, 49, 58, 83: "Activity Metrics", "Top Keys", "Top Models", "Usage Export
  Header"). They are test fixtures for shared components that A6A explicitly lists as
  out of its file scope (ActivityMetrics, TopKeyView, UsageExportHeader), so the
  "test marker" classification holds, but they are not cosmetic: they document that
  the /usage page still renders hardcoded English from shared components in zh. See
  defect P2-3.

Verdict: A6A's classification is accurate. No user-facing hardcoded copy remains in
Wave 3 owned files.

## 2. Targeted tests

Wave 3, explicit paths only (38 test files in the four areas, 14 of them in usage):

```
npx vitest run "src/app/(dashboard)/usage" "src/app/(dashboard)/cost-tracking" \
  "src/app/(dashboard)/cost-optimization" "src/app/(dashboard)/budgets"
```

649 tests passed, 0 failed, no type errors, exit 0.

Wave 1/2 spot checks (no regression):

```
npx vitest run src/i18n/I18nProvider.integration.test.tsx src/i18n/resources.test.ts \
  "src/app/(dashboard)/models-and-endpoints/components/AllModelsTable.test.tsx" \
  "src/app/(dashboard)/models-and-endpoints/page.test.tsx" \
  "src/app/(dashboard)/api-keys/ApiKeysDashboard.test.tsx" \
  "src/components/VirtualKeysPage/VirtualKeysTable.test.tsx"
```

6 files, 106 tests passed.

## 3. Engineering gates

| Gate | Result | Wave 3 attribution |
|---|---|---|
| `npm run build` | PASS, 51 static routes, exit 0 | clean |
| `npm run lint` | FAIL: 1 error, 3421 warnings | error is pre-existing (see below) |
| `npm run format:check` | FAIL: 290 files | Wave 3 introduced 17 of them |

Lint error: `src/i18n/I18nProvider.gate.integration.test.tsx:73` —
`testing-library/prefer-find-by`. This is a Wave 1 platform test file, untouched by
Wave 3. It still fails the G3 gate as defined.

format:check fails on 290 files including `src/i18n/resources/registry.ts` (Wave 1)
and models-and-endpoints files (Wave 2), so the baseline was already red; Wave 3
added 17 new offenders: budgets (budget_modal.tsx, BudgetTable.tsx,
BudgetTableColumns.tsx, edit_budget_modal.tsx), cost-optimization
(AutoRouterBenchmarksTab.tsx, CacheLeakageCard.tsx, PromptCompressionTab.tsx,
ShadowEvalSection.tsx, ShadowEvalStartForm.tsx, TierTurnsChart.tsx, UsageTab.tsx),
cost-tracking (add_margin_form.tsx, cost_tracking_settings.tsx,
pricing_calculator/index.tsx, multi_cost_results.tsx, multi_export_utils.ts,
multi_export_utils.test.ts), usage (EndpointUsageLineChart.tsx, EndpointUsageTable.tsx,
EntityUsage.tsx, SpendByProvider.tsx, TeamUserSpendCard.tsx, UsageAIChatPanel.tsx).

## 4. Dictionary review (zh, against GLOSSARY_EN_ZH.md)

Read in full: `src/locales/zh-CN/usage.json` (133 keys), `cost.json` (387 keys),
`budgets.json` (71 keys), cross-checked against the en side.

Terminology is consistent with the glossary where it matters: 提供商 (provider),
虚拟密钥 (virtual key), 花费/成本 split correctly (已花费 vs 成本/费用), 用量 (usage),
Token untranslated, 启用/停用, 筛选, 导出, 预算上限 (Budget Limit), 网关 (gateway).
Plural `_one/_other` pairs are present where interpolation uses count. Full-width
punctuation is used in most body copy, including curly quotes around “添加提供商折扣”.

Punctuation inconsistency (see P2-4): several loading/progress strings use half-width
`...` while sibling strings use `…` (glossary: Loading… 加载中…).

## 5. Chinese layout risk (static review, manual walkthrough list)

Static sweep for fixed widths, min-w on text containers, truncate and
whitespace-nowrap across the four Wave 3 areas. No width is sized to English copy
specifically; most containers use `min-w-0` + flex. Items needing human walkthrough
at zh + narrow viewport:

1. `usage/_components/components/UsageViewSelect/UsageViewSelect.tsx:173` — SelectTrigger
   `w-54 sm:w-64 md:w-72` holds the longest labels “用户 Agent 活动”, “Agent 用量 (A2A)”.
   Check no clipping at the 54 (sm) step.
2. `cost-optimization/_components/AutoRouterBenchmarksTab.tsx:117` — bucket label spans
   sized by `width: ${sharePct}%` with `whitespace-nowrap`; sublabels like
   “上一轮 -> 相同层级” can clip when a bucket's share is small.
3. `cost-tracking/_components/how_it_works.tsx:69-81` — `whitespace-nowrap` code chips
   for `x-litellm-response-cost-discount-amount` overflow horizontally on narrow screens.
4. `cost-optimization/_components/ShadowEvalSection.tsx:285-287` — headline with three
   `<mono>` interpolations (“将 X 与 Y 在 Z 流量的 N% 上进行对比”) is long; it wraps, but
   verify the mono segments break acceptably.
5. `budgets/_components/BudgetTableColumns.tsx:111` — budget ID cell with copy button and
   `whitespace-nowrap`; confirm column sizing in zh is unchanged.

## 6. E2E status

`tests/e2e/ui/` exists with product Playwright infrastructure (playwright.config.ts,
globalSetup, specs for usage/budgets/navigation/models/etc.) but contains **zero
i18n/locale specs** — no language-switch, refresh-persistence, `<html lang>` or
raw-key-leak assertions (grep for locale/language/LanguageSwitcher over tests/ and
helpers/ returns nothing). T-01's i18n smoke from Wave 1 remains unlanded. Recorded as
a gap; per instructions no new E2E infra was built this round.

## 7. Defect list

P0: none found. No crashes, no missing keys at runtime, build and all targeted tests green.

### P1 (translation error / term violation / user-visible English leak)

| ID | Where | What | Suggested owner |
|---|---|---|---|
| P1-1 | `src/app/(dashboard)/budgets/_components/BudgetTableColumns.tsx:43` (`BudgetDurationCell`) | Renders `getBudgetDurationLabel(value)` from `src/components/common_components/budget_duration_dropdown.tsx:54`, which returns hardcoded English “hourly/daily/weekly/monthly”. The A6B report claims the budgets table maps durations through `budgets:table.filters.duration.*` — true for the filter drawer (`BudgetTable.tsx:148` uses `durationLabel(t, ...)`) but **false for the Reset Period table column**, which is the most visible surface. zh users see English duration values in the table. No test asserts this cell, which is why it slipped. | 6B |
| P1-2 | `src/app/(dashboard)/usage/_components/components/EntityUsage/EntityUsage.tsx:279, 292, 398, 454` | `capitalizedEntityLabel` is the raw English entity type (“Team”, “Key”, “Model”, “Customer”, “Tag”, “Agent”), interpolated into zh strings built for Chinese nouns: `usage:entity.spendOverview` (“Team花费概览”), `spendBy` (“按Team花费：”), `spendPer`, `noEntitySpendData`, `totalEntities`, plus the table column header at line 292. Mixed-script user-visible text on every EntityUsage tab in zh. Fix direction: pass localized entity nouns from `usage:viewSelect.*`/a new entity-label key set instead of `entityType.charAt(0).toUpperCase()`. | 6A |
| P1-3 | `src/app/(dashboard)/models-and-endpoints/components/AccessGroupBudgetColumns.tsx:153` | Same English `getBudgetDurationLabel` rendered on the models-and-endpoints page, which is in v1 scope (Wave 2 area). A6B flagged the helper as a leftover but consumers outside /budgets were left unverified. | 6B / models-and-endpoints owner |

### P2 (experience / consistency / gate hygiene)

| ID | Where | What | Suggested owner |
|---|---|---|---|
| P2-1 | `src/i18n/I18nProvider.gate.integration.test.tsx:73` | The single eslint error blocking `npm run lint` (prefer-find-by). Pre-existing Wave 1, but it fails the G3 lint gate as defined. | Agent 7 / platform |
| P2-2 | 17 Wave 3 files (list in section 3) | `format:check` red; Wave 3 committed without running Prettier. Baseline was already red (290 files), so gate hygiene predates Wave 3. | 6A/6B for their files, Agent 0 for baseline policy |
| P2-3 | Shared components consumed by /usage (A6A leftovers): SavingsTiles, ActivityMetrics, UsageExportHeader, TopKeyView/ViewUserSpend, CloudZeroExportModal, EntityUsageExportModal, ModelViewToggle, UserAgentActivity, UsageAIChatPanel tool labels | Hardcoded English visible in zh on the /usage page. Known and documented by A6A; verified still open. Needs an owner assignment for Wave 4. | Agent 0 to assign |
| P2-4 | `zh-CN/usage.json:122-123` (思考中..., 询问你的用量...), `zh-CN/cost.json:91-92, 105, 256, 324, 333, 391` (正在加载配置..., 正在更新..., 正在计算成本..., loadingResults, 正在停止..., 正在启动...) | Half-width ellipsis inconsistent with the full-width `…` used elsewhere (e.g. usage page.表格 loading “预算加载中…” budgets.json:66) and with the glossary Loading… entry. | 6A |
| P2-5 | `zh-CN/usage.json:138` | “Agent 用量 (A2A)” uses half-width parentheses; body copy elsewhere uses full-width （）. | 6A |
| P2-6 | `zh-CN/cost.json:28` | “费用/价格加价” for “Fee/Price Margin” is stiff and stacks 加价 twice with the surrounding margin form strings; suggest “加成/费用（Margin）” or glossary review by Agent 2 in Wave 4A. | Agent 2 |
| P2-7 | `tests/e2e/ui/` | No i18n/locale Playwright specs at all (T-01 i18n smoke not landed). | Agent 0 / Wave 4A |

## 8. Verification of 6A/6B reported leftovers

| Leftover claim | Verification |
|---|---|
| A6A: scan hits are false positives / test markers | Holds, item by item (section 1.3). The 4 test markers correspond to genuinely un-localized shared components (P2-3). |
| A6A: shared components on /usage keep hardcoded English | Confirmed still true (P2-3). |
| A6A: /old-usage not localized, out of v1 scope | Confirmed consistent with V1_TRANSLATION_SCOPE §1.4 (only /usage listed). No action. |
| A6A: pre-existing type errors in agentControlPlaneView/AutoRouterBenchmarksTab/ShadowEvalSection tests | Vitest run reports "Type Errors: no errors" via the vitest pipeline for these paths; no failures surfaced in this round. |
| A6B: `budgetFilters.ts` labels and `budget_duration_dropdown.tsx` labels live outside A6B scope; budgets table maps through budgets keys | Half true. The filter drawer does; the **table duration column does not** — that is P1-1. AccessGroupBudgetColumns.tsx:153 also leaks (P1-3), and the same helper renders English on teams/users pages (Teams.tsx:279, TeamSSOSettings.tsx:264, user_info_view.tsx:663; those pages are outside v1 scope). |
| A6B: MoneyCell/DateCell shared formatting out of scope | Not audited this round; recommend Agent 2 confirms locale-aware currency/date formatting in Wave 4A. |
| A6B: budgets components not embedded by team/keys pages | Confirmed for embedding; but the helper direction leaks English *into* a v1 page (P1-3). |

## 9. Overall conclusion: G3 verdict

**G3: FAIL**, on gate hygiene and two P1 translation leaks.

| Criterion | Status |
|---|---|
| en/zh key sets, shape, interpolation consistent | PASS |
| No dangling component key references | PASS (dynamic refs all resolved) |
| Targeted tests (Wave 3 + Wave 1/2 spot checks) | PASS (649 + 106 tests) |
| No P0 | PASS |
| No P1 | **FAIL** (P1-1, P1-2, P1-3) |
| lint | **FAIL** (1 pre-existing error) |
| format:check | **FAIL** (290 files, 17 from Wave 3) |
| build | PASS |

Functional quality of the Wave 3 localization work is high: dictionaries are thorough,
terms follow the glossary, tests have real teeth (they resolve keys through the real
dictionary). The G3 failure is narrow: two label leaks (one line fix each), one
shared-helper leak, and commit hygiene (prettier + one pre-existing lint error).
Re-run G3 after P1-1/P1-2/P1-3 fixes, a `prettier --write` pass, and the single
prefer-find-by fix.
