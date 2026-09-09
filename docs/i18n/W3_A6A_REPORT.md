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
