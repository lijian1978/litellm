# V1_SCOPE_MANIFEST

> 维护者：Agent 0。补建于 Wave 4A 终审（此前文档多处引用本文件但从未创建）。
> 范围来源：V1_TRANSLATION_SCOPE.md；状态以 Wave 1-4 各报告与 TASK_BOARD 为准（2026-09-09）。

## v1 范围状态

| # | 区域 | 状态 | 证据 |
|---|---|---|---|
| 1 | 全局壳层/导航 | 已完成 | W2 A5 交付 + W4 回归 |
| 2 | 认证（登录/SSO 引导） | 已完成 | W2 A5 交付 |
| 3 | Models / Models & Endpoints | 已完成 | W2 A6 交付 |
| 4 | API Keys（Virtual Keys） | 已完成 | W2 A6 交付 |
| 5 | Usage（/usage） | 已完成 | W3 A6A 交付 + W4B D-12 收尾 |
| 6 | Cost Tracking | 已完成 | W3 A6A 交付 |
| 7 | Cost Optimization | 已完成 | W3 A6A 交付 |
| 8 | Budgets | 已完成 | W3 A6B 交付 |
| 9 | 语言切换（全站） | 已完成 | W1 A4 平台 + W4 A7 链路审查 |
| 10 | i18n 基础设施（Provider/门禁/持久化） | 已完成 | W1 A4 交付 |

## 记为 v2（A0 裁决 2026-09-09，用户确认）

| 区域 | 原因 |
|---|---|
| Onboarding | 无任何中文化覆盖；Wave 4A 发现后用户裁决不纳入本轮 |
| Connect | 同上 |
| MCP OAuth | 同上 |
| /old-usage | 不在 v1 翻译范围（V1_TRANSLATION_SCOPE 已注明） |
| SavingsTiles、MoneyCell、getBudgetDurationLabel 其余消费方、budgetFilters | A2 Wave 4 裁决可接受留英文 |
| E2E 完整 locale 回归矩阵 | 本轮仅补 smoke（D-8），完整矩阵留 v2 |
| AI-chat 工具标签/错误文案 | 文案来自后端，需后端配合 |

## 已知豁免

- 全仓 `format:check` 既有基线红（258 个项目前遗留文件）：用户裁决豁免；i18n 相关文件全部通过 Prettier。
