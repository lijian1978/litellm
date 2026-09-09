# LiteLLM Dashboard i18n — TASK_BOARD（多智能体进展看板）

> 维护者：Agent 0。**每启动/交付/Review 一个 Agent 即更新本表**。这是你查看"谁在工作、进展到哪"的单点真相。
> 状态取值：待命 / 进行中 / 待 Review / 已完成 / 被阻塞

## Wave 0 — 并行设计（G0 门禁前）

| Agent | 名称 | 状态 | worktree/分支 | 交付物 | 最后更新 |
|---|---|---|---|---|---|
| A1 | i18n-architect | **已完成 ✅（G0 Review 通过）** | （纯设计） | I18N_TECH_DESIGN / I18N_ADR / POC_REPORT / TECH_RISKS | 2026-09-09 G0 |
| A2 | localization-designer | **已完成 ✅（G0 Review 通过）** | （纯设计） | LOCALIZATION_SPEC / GLOSSARY_EN_ZH(63条) / LANGUAGE_SWITCHER_SPEC / V1_TRANSLATION_SCOPE / LOCALE_NAVIGATION_BEHAVIOR | 2026-09-09 G0 |
| A3 | qa-architect | **已完成 ✅（G0 Review 通过）** | （纯设计） | I18N_TEST_PLAN / TEST_CASES(26) / TEST_TOOLS / REGRESSION_MATRIX | 2026-09-09 G0 |

**G0 门禁结论（Agent 0，2026-09-09）：APPROVED**
- 首屏策略已选定「就绪门禁 + `<html lang>` 同步」（ADR-04，非"再评估"）。
- 后端无 `UI settings.language`（ADR-07 Accepted）。
- 构建期 `<title>`/meta 保持英文边界已记录（ADR-06 Accepted）。
- 整页跳转语言保持规则已写入本地化与测试方案（LOCALE_NAVIGATION_BEHAVIOR + TEST_CASES TC-16..18）。
- E2E 基建缺口已定：选 **a（Wave 1 补齐 Playwright）**，见 DECISIONS P3/P4。
- **G0 Review 发现 1 个需修正点（P5）**：语言偏好存储键名跨文档不一致（`dashboard.locale` vs `litellm.locale`）。**已定统一为 `litellm.locale`**，由 A4 以单一常量实现，A5/6 不直接操作存储。
- G0 Review 确认 POC_REPORT 9 项必验项已具备（待 Wave 1 A4/A7 回填证据）。

## Wave 1 — 平台能力与测试基础

| Agent | 名称 | 状态 | worktree/分支 | 交付物 | 最后更新 |
|---|---|---|---|---|---|
| A4 | i18n-platform-developer | **实现完成 ✅；build 验证进行中** | i18n/w1-agent4-platform | src/i18n/** + 8 namespace 骨架 + layout + LanguageSwitcher + Playwright基建 + 依赖写入 + 30单测/7集成测试通过 | 2026-09-09 |
| A5 | i18n-shell-auth-developer | **只读盘点完成 ✅** | —（只读） | W2_SHELL_INVENTORY.md（~170 key，25 文件） | 2026-09-09 |
| A7 | i18n-qa | **工具开发完成 ✅** | i18n/w1-agent7-qa | scripts/i18n/check-keys + scan-hardcoded + 测试（待 A4 集成后正式跑 vitest） | 2026-09-09 |

**Wave 1 集成基线（Agent 0，本地，未 push）**
- 分支 `i18n/w1-integration`（主 worktree）= 基线 `31e3a76d3f` → 平台 `37dd0678f6`（含你的修复 `6321c8b52d`）→ A7 QA `fff2c41c44` 合并。
- A4 平台 33 单测 + 7 集成全过；A7 QA 19 测试全过（**修复 1 处 A7 测试漏引号 typo**）。
- A7 的 check-keys 对 A4 8 namespace 端到端 **PASS**。
- **未决**：集成分支 `npm run build` 验证中（后台）；PLATFORM_VALIDATION_REPORT、PoC 回填待补；push 因无 GitHub 凭据暂缓（用户决定不 push）。

## Wave 2 — 第一批功能

| Agent | 名称 | 状态 | worktree/分支 | 交付物 | 最后更新 |
|---|---|---|---|---|---|
| A5 | i18n-shell-auth-developer | **已完成 ✅（已合并）** | i18n/w2-agent5-shell | 29 文件壳层+认证本地化；build 51/51、52单测+7集成 | 2026-09-09 |
| A6 | i18n-feature-developer | **已完成 ✅（已合并）** | i18n/w2-agent6-models | 28 文件 Models+API Keys；build 51/51、52单测+31组件测试 | 2026-09-09 |
| A7 | i18n-qa | **部分完成（工具✅，E2E 缺口⚠️）** | i18n/w2-agent7-qa | check-keys-dangling 工具+测试；E2E 断言未落地 | 2026-09-09 |

**Wave 2 集成（Agent 0，本地，未 push）**
- 已合并 A5 (`d3a7eb8555`) + A6 (`0f8c91a8ae`) + A7 (`4d344c23de`) 到 `i18n/w1-integration`，无冲突。
- 各分支独立 build 全绿（51/51）；A5+A6 字典 en/zh key 一致（check-keys PASS）。
- **关键接缝 R1 已正确落地**：menuGroups 用 key，渲染/面包屑/UI-Settings 都 `t()` 翻译，无原始 key 泄漏。
- **未决**：① 合并后联合 build 验证中（后台）→ ② E2E Playwright 断言缺口（A7 未落地）→ ③ push 暂缓。

## Wave 3 — 第二批功能

| Agent | 名称 | 状态 | worktree/分支 | 交付物 | 最后更新 |
|---|---|---|---|---|---|
| A6A | i18n-feature-developer (Usage/Cost) | **已完成 ✅（含回归修复 D-2/D-7）** | i18n/w3-agent6a-usage | 43 文件 Usage+Cost+CostOptimization；usage 133+ key、cost 387 key；599 测试、build 51/51 | 2026-09-09 |
| A6B | i18n-feature-developer (Budgets) | **已完成 ✅（含回归修复 D-1/D-3）** | i18n/w3-agent6b-budgets | budgets 5 组件 + 72 key；scan 15→0；51 测试、build 51/51 | 2026-09-09 |
| A7 | i18n-qa | **回归完成 ✅（修复后复验 G3 PASS）** | i18n/w1-integration | W3_A7_REGRESSION_REPORT（`b8d7ecdb89`）；3 P1 已修复，Agent 0 复验通过 | 2026-09-09 |

**Wave 3 集成（Agent 0，本地，未 push）**
- 6A (`ee23dea299`) + 6B (`2c5ec93b3f`) 已合并到 `i18n/w1-integration`，无冲突。
- 联合验证：check-keys 8 namespace 全 PASS；合并后 `npm run build` 全绿（51 路由）。
- **遗留**（详见 W3_A6A/A6B_REPORT）：/old-usage 不在 v1 范围；若干共享组件（SavingsTiles、MoneyCell/DateCell、UsageExportHeader 等）与范围外 helper（budgetFilters 标签、getBudgetDurationLabel）仍英文；AI-chat 工具标签来自后端。
- **未决**：A7 回归、Wave 4 复核、push 暂缓。

## Wave 4 — 集成验收

| Agent | 名称 | 状态 | 交付物 | 最后更新 |
|---|---|---|---|---|
| A2 | localization-designer | 待命 | 术语/中文体验复核 | - |
| A7 | i18n-qa | 待命 | 完整回归 + 质量报告 | - |
| A8 | i18n-integration-release | 待命 | 发布/回滚清单 | - |

## 缺陷队列
（Wave 4B 按 P0 → P1 → 阻塞门禁 P2 → 其他 P2 排序）
| 编号 | 级别 | 描述 | Owner | 状态 |
|---|---|---|---|---|
| D-1 | P1 | BudgetTableColumns.tsx:43 表格"重置周期"列硬编码英文时长标签（A6B 报告此点不实） | A6B | 已修复 ✅ |
| D-2 | P1 | EntityUsage.tsx:279/292/398/454 `{{entity}}` 传原始英文类型，中文渲染 "Team花费概览"/"按Key花费" | A6A | 已修复 ✅ |
| D-3 | P1 | AccessGroupBudgetColumns.tsx:153（models 页）英文时长标签 | A6B | 已修复 ✅ |
| D-4 | P2 | lint 1 个既有 error（I18nProvider.gate.integration.test.tsx:73 prefer-find-by，Wave 1 遗留） | A4 | 已修复 ✅ |
| D-5 | P2 | Wave 3 新增 17 文件未过 Prettier（format:check 290 文件 FAIL，多数既有） | A6A/A6B | 已修复 ✅ |
| D-6 | P2 | A6A 遗留共享组件英文在 /usage 可见（SavingsTiles 等） | A0 裁决 | 排队 |
| D-7 | P2 | 半角省略号/括号不一致（usage.json:122-123、cost.json 多处）及"费用/价格加价"措辞 | A6A | 已修复 ✅ |
| D-8 | P2 | E2E 无 i18n locale 断言（T-01 smoke 未落地） | A7 | 排队 |

**Wave 3 修复轮（Agent 0）**：6A (`d8fdf92d37`) + 6B (`c154994439`) + D-4 (`f9633ee1fa`) 已合并；复验 check-keys PASS、lint 0 error、Wave 3 四目录 prettier 全过、build 51/51、budgets 51 测试全过。**G3 判定：PASS**（D-6/D-8 为非阻塞 P2，留 Wave 4 处理）
