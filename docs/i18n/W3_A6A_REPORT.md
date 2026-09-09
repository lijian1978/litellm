# W3 Agent 6A Report: Usage / Cost Tracking Localization

Branch: `i18n/w3-agent6a-usage`
Commit: `ee23dea299` "feat(i18n): localize Usage & Cost Tracking area (Wave 3)"

## Scope covered

- Cost Tracking (`/cost-tracking`): settings page, provider discount/margin tables and
  forms, block-unpriced toggle, pricing calculator, multi-model export (PDF/CSV via
  injected `t`), how-it-works.
- Cost Optimization (`/cost-optimization`): view shell, usage tab, cache-leakage card,
  auto-router benchmarks (incl. bucket labels moved to i18n keys in
  `autoRouterBenchmarks.ts`), shadow evals section and start form, prompt compression,
  tier turns chart.
- Usage (`/usage`): UsagePageView, UsageViewSelect, EntityUsage, SpendByProvider,
  TeamUserSpendCard, TopModelView, EndpointUsage charts/table, UsageAIChatPanel.
- Namespaces: `usage` (en/zh) grew from 1 to 133 keys; `cost` (en/zh) from 1 to 387 keys
  (173 of which came from the prior WIP session, rest added this session).

Patterns follow Wave 2 precedent `0f8c91a8ae`: `useTranslation()` in components, `t`
passed into helpers/factories (`exportMultiToPDF(result, t)`, column factory hooks),
data identifiers (model names, providers, endpoints, status values from the backend)
left untranslated. Dates on the usage page format via `i18n.language` instead of a
hard-coded `"en-US"` locale. Prompt stays English per glossary; terms follow
GLOSSARY_EN_ZH.md (提供商, 虚拟密钥, 花费/成本, 用量, Token, 启用/停用).

## Changed files

- `src/app/(dashboard)/cost-tracking/_components/**` (13 files incl. tests)
- `src/app/(dashboard)/cost-optimization/_components/**` (10 files incl. tests)
- `src/app/(dashboard)/usage/_components/components/**` (11 files incl. tests)
- `src/locales/{en,zh-CN}/usage.json`, `src/locales/{en,zh-CN}/cost.json`

## QA evidence

- `node scripts/i18n/check-keys.mjs`: PASS, all 8 namespaces en/zh key sets match.
- `node scripts/i18n/scan-hardcoded.mjs` over cost-tracking/cost-optimization/usage:
  remaining 17 hits are all scanner false positives on TypeScript expressions
  (`= 0 && percentValue`, generics in tests) or test-file marker strings; no
  user-facing hardcoded copy left in scope.
- `npx vitest run` on the 47 test files under the three areas: 47 passed / 599 tests.
  Tests asserting copy now resolve through the real en dictionary
  (`multi_export_utils.test.ts` builds `t` from `en/cost.json` and fails on missing
  keys, including i18next plural `_one/_other` resolution).
- `npm run build`: green, 51 static routes. One pre-existing unrelated warning
  (AVIF not supported by Turbopack for `enkrypt_ai.avif` in guardrails logo helpers).
- `npx eslint` on the three areas: 0 errors; ~196 warnings, all pre-existing
  (`no-explicit-any`, testing-library node access in untouched test code, one unused
  eslint-disable in `usePaginatedDailyActivity.ts`, none touched by this work).

## Remaining issues / out of scope

- `/old-usage` page copy is not localized: V1_TRANSLATION_SCOPE lists only `/usage`
  for v1. Flag for a later wave if old-usage stays visible.
- Shared components consumed by the usage pages but owned by other agents keep
  hardcoded English: `SavingsTiles`, `ActivityMetrics`, `UsageExportHeader`,
  `TopKeyView` / `ViewUserSpend`, `CloudZeroExportModal`, `EntityUsageExportModal`,
  `ModelViewToggle`, `UserAgentActivity`, `PaginationStatusAlerts` (its "agent data"
  subject string now comes from the caller via `usage:entity.agentData`).
- `UsageAIChatPanel` renders backend-provided tool labels and errors untranslated.
- Pre-existing type errors exist in `agentControlPlaneView.test.tsx`,
  `AutoRouterBenchmarksTab.test.tsx` (closest() Element), `ShadowEvalSection.test.tsx`
  (missing `by_router` fixtures) and guardrails test files; vitest still runs them.
- `ShadowEvalStartForm` remaining scan hits are expression fragments, not copy.

## Wave 3 回归修复 (A7 G3 回归，D-2 / D-7 / D-5)

Commit: see "fix(i18n): address Wave 3 regression findings (D-2, D-7, D-5)".

- **D-2 (P1)** — `EntityUsage.tsx` 不再将原始英文实体类型传入 `{{entity}}` 插值。
  新增模块级 `entityNoun(entityType, t)`，按实体类型查 `usage:entity.type.*`
  （en: Team/Key/User/Organization/Customer/Tag/Agent；zh: 团队/密钥/用户/组织/
  客户/标签/Agent，遵循 GLOSSARY_EN_ZH），应用于 spendOverview、totalEntities、
  spendBy、spendPer、表格列头、noEntitySpendData；顺带本地化了同源的
  "Filter by {{entity}}" / "Select {{entity}} to filter..."（`usage:entity.filterBy`
  / `filterPlaceholder`）。中文渲染由 "Team花费概览" 变为 "团队花费概览"。
- **D-7 (P2)** — 中文译文统一全角标点：zh `aiChat.thinking`、`aiChat.inputPlaceholder`、
  `entity.andMore_*`、`cost calculator.loading/updating/calculating`、
  `autoRouter.loading`、`shadowEval.loading/loadingResults/stopping`、
  `form.starting`、`entity.filterPlaceholder` 全部改用 "…"；`cost margins.title`
  "费用/价格加价" 统一为 GLOSSARY 术语 "加价"。
- **D-5 (P2)** — 对 Wave 3 提交 `ee23dea299` 的全部 43 个改动文件运行
  `npx prettier --write`；`npx prettier --check` 复核全部通过。

回归验证证据：

- `npx vitest run`（cost-optimization / cost-tracking / usage 全部 47 个测试文件）：
  47 passed / 599 tests。
- `node scripts/i18n/check-keys.mjs`：PASS，8 个 namespace en/zh key 一致。
- `npm run build`：✓ Compiled successfully，51/51 static pages，无错误。

## Wave 4B 修复 (A2 复核，Owner 1：usage 区域)

Commit: see "fix(i18n): address Wave 4A review findings (D-9, D-12)".

- **D-9 (P2)** — a) `cost.json` zh `margins.title` 实际改为 "加价"（上一轮提交信息
  与 diff 不符，本轮落地）；b) `usage.json` zh `viewSelect.agentUsage` 改为
  "Agent 用量（A2A）"（全角括号）。
- **D-12 (P2)** — 按 A2 授权本地化 /usage 页可见的共享组件（文案走 usage namespace）：
  - `src/components/activity_metrics.tsx`（ActivityMetrics：Overall Usage、四张汇总卡、
    Top Virtual Keys by Spend、每日花费/请求、Token/请求趋势、Prompt 缓存指标、
    Unknown Item 等，`usage:activity.*` 新增 19 个 key）；
  - `src/components/EntityUsageExport/UsageExportHeader.tsx`（Export Data 按钮、
    无选项占位 "No {{entity}} with usage in this range"（经 `usage:entity.typePlural.*`）、
    "No options found"、清除筛选 aria-label，`usage:exportHeader.*`）；
  - `ModelViewToggle`（2 个 label，`usage:modelView.*`）；
  - `src/components/view_user_spend.tsx`（Total Spend / Max Budget /
    "$X limit" / "No limit"，`usage:viewUserSpend.*`）；
  - `src/components/UsagePage/components/EntityUsage/TopKeyView.tsx`
    （列头、标签 tooltip、显示数量 aria、Table/Chart View、图例字段、关闭按钮，
    `usage:topKeys.*`）。
  按 A2 裁决未动：SavingsTiles、MoneyCell、getBudgetDurationLabel 其余消费方、
  budgetFilters。
- `UsageExportHeader.test.tsx` 同步更新占位与 aria 断言（占位改为经 typePlural 的
  "No Tags with usage in this range"）。

回归验证证据：

- `npx vitest run`（ActivityMetrics / UsageExportHeader / TopKeyView 测试 + usage
  区域全部测试，17 个文件）：17 passed / 304 tests。
- `node scripts/i18n/check-keys.mjs`：PASS。
- `npx prettier --check` 所改文件：全部通过。
- `npm run build`：✓ Compiled successfully，51/51 static pages，无错误。
