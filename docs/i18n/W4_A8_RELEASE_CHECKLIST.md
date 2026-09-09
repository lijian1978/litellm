# Wave 4A — 发布检查清单与回滚计划（Agent 8, i18n-integration-release）

> 角色：Agent 8（`i18n-integration-release`）· Wave 4A
> 分支：`i18n/w1-integration`（本地，未 push）· HEAD `d86563017a` · 基线 `31e3a76d3f`
> 日期：2026-09-09。本文档只汇总证据与清单，不修改产品代码。
> 输入：`I18N_MULTI_AGENT_PLAN.md` §11、`MASTER_PLAN.md`、`TASK_BOARD.md`、`PLATFORM_VALIDATION_REPORT.md`、`W3_A6A_REPORT.md`、`W3_A6B_REPORT.md`、`W3_A7_REGRESSION_REPORT.md`、`TECH_RISKS.md`（W4_A2_REVIEW / W4_A7_FINAL_REPORT 撰写时尚未落盘，未纳入）。

---

## 1. v1 完成定义逐条核对（§11，15 条）

| # | 条目 | 判定 | 证据指针 / 缺证补证命令 |
|---|---|---|---|
| 1 | 支持 `en` 与 `zh-CN` | **满足** | `src/i18n/resources/registry.ts` 8 namespace；`src/locales/{en,zh-CN}/` 8 套 JSON；check-keys PASS（本轮复跑，8/8 一致） |
| 2 | 语言切换即时生效，刷新后偏好保留 | **满足** | `I18nProvider.integration.test.tsx`（7 集成测试过，PLATFORM_VALIDATION_REPORT §4）；`localePreferences.test.ts`；`litellm.locale` cookie+localStorage 双写（ADR-05）。E2E 层面见 #7 缺口 |
| 3 | 导航、Login、Onboarding、Connect、MCP OAuth、Models、API Keys、Usage、Cost Tracking、Budgets 中文化 | **部分满足** | 导航/Login（W2 `d3a7eb8555`）、Models/API Keys（`0f8c91a8ae`）、Usage/Cost（`ee23dea299`）、Budgets（`2c5ec93b3f`）均有报告；**Onboarding / Connect / MCP OAuth 无任何 Wave 报告覆盖**，需 W4A7 复核或补证：`node scripts/i18n/scan-hardcoded.mjs "src/app/(dashboard)/onboarding" "src/components/..."`（按实际路径） |
| 4 | 中文缺失回退英文，不显示 key | **满足** | `i18n.ts` `fallbackLng:'en'` + `missingKeyHandler`；就绪门禁（ADR-03）；A7 报告 §7「No P0, no missing keys at runtime」；check-keys 0 missing |
| 5 | 中文界面无严重截断、重叠、遮挡 | **部分满足** | A7 报告 §5 静态排查无致命宽度问题，但留 5 处需人工走查（UsageViewSelect、AutoRouterBenchmarksTab、how_it_works code chips、ShadowEvalSection、BudgetTableColumns）。补证：zh + 窄视口人工走查清单逐项确认 |
| 6 | 切换语言不清空表单、不触发异常请求 | **部分满足** | `I18nProvider` 门禁重挂载行为有集成测试；但无针对「表单状态保留 / 无多余网络请求」的专项用例。补证：W4A7 增加回归项或 Playwright spec |
| 7 | Login/SSO/MCP OAuth 整页跳转返回后偏好保持 | **部分满足** | `localePreferences.ts` 双层存储 + `LOCALE_NAVIGATION_BEHAVIOR.md` 规则 + TC-16..18 设计；**E2E 无 i18n spec（D-8，A7 报告 §6）**。补证：落地 T-01 i18n smoke 或记录经批准的降级限制 |
| 8 | `<title>`/metadata 保持英文 | **满足** | `src/app/layout.tsx` metadata 未改（ADR-06 Accepted）；W3 两份报告均确认「Metadata title/description stay English」 |
| 9 | 模型名、API 字段、日志、代码示例未被错误翻译 | **满足** | A6A 报告「data identifiers (model names, providers, endpoints, status values) left untranslated」；A7 报告 §4 术语复核确认 Token/代码块不译；Prompt 保持英文 |
| 10 | 相关单元及集成测试通过 | **满足** | 平台 33 单测 + 7 集成；Wave 3 定向 649 + Wave 1/2 抽查 106 全过（A7 §2）；budgets 51（A6B 修复轮） |
| 11 | `lint`、`format:check`、静态导出构建通过 | **部分满足** | G3 复验（TASK_BOARD Wave 3 修复轮）：lint 0 error、build 51/51 全绿、Wave 3 文件 prettier 全过；**但全仓 `format:check` 基线仍有 ~290 个既有文件 FAIL（非本轮引入）**。补证：`npm run lint && npm run build`；`npx prettier --check .` 确认 i18n 相关文件 0 违例 |
| 12 | Agent 7 提交测试报告 | **部分满足** | `W3_A7_REGRESSION_REPORT.md`（`b8d7ecdb89`）已交付且 G3 复验 PASS；**Wave 4 全量回归报告（W4_A7_FINAL_REPORT）尚未落盘** |
| 13 | Agent 2 完成术语与中文体验复核 | **未满足** | Wave 4A2 复核尚未交付（TASK_BOARD A2「待命」）；P2-6 措辞项已列待 A2 |
| 14 | Agent 0 完成最终 Review 并给出 `APPROVED` | **未满足** | G4 门禁未执行，依赖 #3/#13/#15 |
| 15 | `V1_SCOPE_MANIFEST.md` 全部项目完成并附证据 | **未满足** | 该文件**尚不存在**于 docs/i18n/；需 Agent 0/A8 按 V1_TRANSLATION_SCOPE 生成并逐项附证据 |

**统计：5 满足 / 7 部分满足 / 3 未满足（5/15 满足）。**

关键阻塞项（进入 G4 前必须闭环）：
1. Onboarding / Connect / MCP OAuth 中文化无覆盖证据（#3）。
2. E2E i18n 断言缺口（D-8，#2/#7）。
3. A2 术语复核、A0 最终 Review、V1_SCOPE_MANIFEST（#13/#14/#15）。
4. 全仓 format:check 基线红（#11）——建议 Agent 0 裁决是否纳入 v1 门禁或记录豁免。

---

## 2. 发布检查清单（RELEASE_CHECKLIST）

### 2.1 合并策略与分支拓扑

```
$ git log --graph --oneline 31e3a76d3f..HEAD
* d86563017a docs(i18n): record Wave 3 fix round and G3 PASS verdict
*   46d8147b0a Merge branch 'i18n/w3-agent6b-budgets' into i18n/w1-integration
|\
| * c154994439 fix(i18n): route budget duration labels through budgets keys (D-1/D-3)
* |   a9b7bf5a3a Merge branch 'i18n/w3-agent6a-usage' into i18n/w1-integration
|\ \
| * | d8fdf92d37 fix(i18n): address Wave 3 regression findings (D-2, D-7, D-5)
* | | f9633ee1fa fix(i18n): replace waitFor with findBy in gate test (D-4)
* | | b8d7ecdb89 test(i18n): Wave 3 regression report (Agent 7)
* | | 19ef574fcc docs(i18n): record Wave 3 A6A/A6B completion and integration status
* | |   7052ea92ab Merge branch 'i18n/w3-agent6b-budgets' into i18n/w1-integration
|\ \ \
| |/ /
|/| /
| |/ 
|/|
| * 835bce2098 docs(i18n): record Wave 3 A6B Budgets localization report
| * 2c5ec93b3f feat(i18n): localize Budgets feature area (Wave 3)
* | e634686324 docs(i18n): add W3 Agent 6A usage/cost localization report
* | ee23dea299 feat(i18n): localize Usage & Cost Tracking area (Wave 3)
|/
* 095d5ad8e6 docs(i18n): record Wave 2 integration status
*   62451807b2 Merge A7 QA dangling checker into Wave 2 integration
|\
| * 4d344c23de test(i18n): add dangling translation-key checker (Wave 2 QA)
* |   c49e7bbf72 Merge A6 Models/API Keys localization into Wave 2 integration
|\ \
| * | 0f8c91a8ae feat(i18n): localize Models & API Keys feature area (Wave 2)
* | / d3a7eb8555 feat(i18n): localize global shell and auth entry (Wave 2)
|/ /
* / 97bbe3c9f8 test(i18n): fix missing quote in check-keys test; add Wave 1 validation docs
* /  22696b5098 Merge A7 QA tooling (check-keys + scanner) into Wave 1 integration
|\
| * fff2c41c44 test(i18n): add QA tooling for key consistency and hardcoded scan
* | 37dd0678f6 feat(i18n): add internationalization platform infrastructure
* | 6321c8b52d fix(ui): correct i18next type augmentation scope and client boundary
|/
* 31e3a76d3f docs(i18n): add internationalization design baseline (Wave 0)
```

总量：`31e3a76d3f..HEAD` = **142 files changed, +8131 / −1730**。合并策略建议：整体以一个 PR（`i18n/w1-integration` → `main`）squash-merge 或 merge-commit 均可；若走 merge commit，保留上述 merge 拓扑即可按 Wave 粒度回溯。

### 2.2 push 前置条件（当前无凭据）

remote = `https://github.com/BerriAI/litellm.git`（origin）。凭据配置后执行：

```bash
# 方式 A：gh CLI（推荐）
gh auth login            # 或 gh auth login --with-token < token.txt
git push -u origin i18n/w1-integration

# 方式 B：HTTPS 凭据（osxkeychain）
git config --global credential.helper osxkeychain
git push -u origin i18n/w1-integration

# 方式 C：SSH
git remote set-url origin git@github.com:BerriAI/litellm.git
git push -u origin i18n/w1-integration
```

push 前自检（已在本地验证的等价命令）：
- `cd ui/litellm-dashboard && node scripts/i18n/check-keys.mjs`（本轮复跑 PASS，8/8）
- `npm run lint`（G3 复验 0 error）
- `npm run build`（51/51 静态路由）

### 2.3 合并到主干的前置门禁（G4）

1. §11 的 3 条未满足项闭环（A2 复核、A0 Review、V1_SCOPE_MANIFEST）。
2. D-6（共享组件英文残留）、D-8（E2E locale 断言）由 Agent 0 裁决：修复或记录为 v1 已知限制。
3. Onboarding/Connect/MCP OAuth 覆盖证据补齐（扫描 + 人工确认）。
4. CI 关注点（来自 `ui/litellm-dashboard/CLAUDE.md` 与仓库门禁）：
   - **Check UI API Types Sync**：本轮未改后端路由/响应模型、未改 `schema.d.ts`，应无影响；若 PR 报错需 `npm run gen:api`。
   - **lint gate**：不得新增 eslint suppression；`I18nProvider.gate.integration.test.tsx` 的 prefer-find-by 已修复（`f9633ee1fa`）；确认 `eslint-suppressions.json` 无需 prune。
   - **Prettier/format**：i18n 改动文件已全部 `prettier --write`（D-5 修复）；全仓既有 290 文件红为基线问题，需在 PR 描述中说明或单独治理。
   - **测试**：vitest unit + integration 全绿；Playwright E2E（基建已入，i18n spec 待补）。

### 2.4 字典文件清单与 key 总数

`src/locales/{en,zh-CN}/`，本轮实测（含嵌套 key 展开计数）：

| Namespace | en keys | zh-CN keys |
|---|---|---|
| apiKeys.json | 50 | 50 |
| auth.json | 108 | 108 |
| budgets.json | 84 | 84 |
| common.json | 16 | 16 |
| cost.json | 387 | 387 |
| models.json | 206 | 206 |
| navigation.json | 117 | 117 |
| usage.json | 142 | 142 |
| **合计** | **1110** | **1110** |

en/zh 完全一致；check-keys（key set / shape / interpolation）8/8 PASS。复跑命令：

```bash
cd ui/litellm-dashboard && node scripts/i18n/check-keys.mjs
```

---

## 3. 回滚清单（ROLLBACK_PLAN）

### 3.1 静态导出产物回滚（build 产物替换）

Dashboard 为 `output:"export"` 静态站点，最快回滚是替换产物：

```bash
# 保留当前产物
mv out out.i18n.bad
# 用回滚源（上一版本产物归档 / CI artifact / git 标签对应构建）重建或直接替换
git checkout <pre-i18n-ref> && cd ui/litellm-dashboard && npm ci && npm run build
# 将新 out/ 发布回静态托管位置（S3/OSS/nginx 目录等，按现网发布方式）
```

要点：静态导出无服务端状态，替换目录即完成回滚；i18n 的 cookie（`litellm.locale`）残留在用户浏览器，但旧版代码不读取它，无副作用，无需处理。

### 3.2 git revert 层面（按 Wave 分组的可整体 revert 提交）

i18n 特性提交均位于 `31e3a76d3f..HEAD`。若按分支合并形态 revert 合并提交（`git revert -m 1 <merge-hash>`）：

| Wave | 内容 | 可整体 revert 的提交 | 说明 |
|---|---|---|---|
| Wave 1 平台 | 平台基建 + QA 工具 | `22696b5098`（A7 QA merge）、`37dd0678f6`、`6321c8b52d`、`97bbe3c9f8` | 平台为一切的前提；**若只回滚某个功能 Wave，必须保留 Wave 1**（否则 `useTranslation` 引用全挂） |
| Wave 2 | 壳层/认证 + Models/API Keys + dangling checker | `d3a7eb8555`（直接提交，revert 单提交）、`c49e7bbf72`（A6 merge）、`62451807b2`（A7 merge）、`095d5ad8e6`（docs） | A5 为直接提交（非 merge），单独 `git revert d3a7eb8555` |
| Wave 3 | Usage/Cost + Budgets + 回归修复 | `a9b7bf5a3a`（6A merge，含 `d8fdf92d37`）、`46d8147b0a`（6B merge，含 `c154994439`）、`7052ea92ab`（6B 首次 merge）、`f9633ee1fa`（D-4）、`b8d7ecdb89`（docs） | 6A/6B 的修复提交随各自 merge 提交一并回滚 |

注意事项：
- 各功能分支依赖共享字典 namespace 划分，彼此独立，可按上表单独回滚某 Wave；**但 Wave 3 依赖 Wave 2/1 的平台与注册表，不可跨越回滚**。
- `f9633ee1fa`（D-4 lint 修复）与功能无耦合，可保留。
- 回滚后必跑：`node scripts/i18n/check-keys.mjs` + `npm run build` + `npm run lint`，确认无 dangling 引用（`check-keys-dangling.mjs "src"`）。
- 由于整分支尚未 push/合并主干，**最干净的「git 层面回滚」其实是丢弃未合并分支本身**（主干无需任何操作）。

### 3.3 功能开关层面

检查结果：`src/i18n/**` **当前没有任何 feature flag**（无 `NEXT_PUBLIC_*` 开关、无 enabled/disabled 环境变量；grep 命中仅为 eslint-disable 注释与测试用例名）。i18n 是「默认始终开启」的无条件行为。

加开关的成本评估（建议，未实现）：
- **低成本方案**：初始化门禁开关——在 `I18nProvider` 读取一个 `NEXT_PUBLIC_I18N_ENABLED`（默认 true）；为 false 时 `getI18n()` 强制 `lng:'en'`、跳过语言检测与切换器渲染。改动集中在 `src/i18n/i18n.ts`、`I18nProvider.tsx`、`LanguageSwitcher` 三处（A4 独占文件），约半天工作量 + 现有 40 个测试补 2-3 个开关用例。
- **不建议**按功能区域做细粒度开关：8 个 namespace 已静态打进 bundle，按区域关回英文需在每个功能组件入口加条件分支，侵入 100+ 文件，成本远超收益。
- 结论：若发布方要求「一键逃生」，推荐上述全局开关；否则静态产物替换（§3.1）与分支回滚（§3.2）已足够。

### 3.4 回滚后验证步骤

1. `npm run build`（或直接确认替换后的产物存在且为新构建）。
2. 打开首页：无 `i18n::key` 形式字符串、`<html lang>` 恢复默认、切换器不存在（若回滚平台层）或仅 en（若仅回滚功能层）。
3. `node scripts/i18n/check-keys.mjs` 与 `check-keys-dangling.mjs "src"`（若只回滚部分 Wave）exit 0。
4. `npm run lint` 0 error、vitest unit/integration 全绿。
5. 抽查 v1 范围页面（导航、登录、Models、API Keys、Usage、Cost、Budgets）渲染正常。

---

## 4. 风险登记（TECH_RISKS 与本轮相关条目现状）

| 编号 | 风险 | 现状 | 证据 |
|---|---|---|---|
| R1 | 首屏语言闪烁 / 暴露 key | **已缓解** | 就绪门禁 + `<html lang>` 同步实现（ADR-03/04）；7 个集成测试覆盖；无运行时暴 key 的 P0/P1（A7 §7） |
| R2 | react-i18next 与 React 19 / Next 16 兼容性 | **已证伪（风险未发生）** | `i18next@^26.4.2` + `react-i18next@^17.0.13` 构建通过、51/51 静态路由、649+106 测试全过（PLATFORM_VALIDATION_REPORT、A7 §2/§3） |
| R3 | `<Trans>` 瞬态暴露占位 | **已缓解** | 统一顶层门禁覆盖全局子树；本轮报告未出现 `<Trans>` 相关缺陷 |
| R4 | 偏好存储不一致 / 跨跳转丢失 | **已缓解（实现层）/ 仍开放（E2E 层）** | 双写收敛 + SameSite=Lax（ADR-05）+ 单测；整页跳转分支无 E2E 断言（D-8） |
| R5 | 依赖锁分叉 | **已缓解** | 单一写入者规则执行；集成期间无锁冲突记录 |
| R6 | 共享 i18n 单点写冲突 | **已缓解** | FILE_OWNERSHIP 遵守；Wave 2/3 合并均无冲突（TASK_BOARD） |
| R7 | en/zh 键集合漂移 | **已缓解** | check-keys 8/8 PASS（本轮复跑）；CI 脚本已入库 |
| R8 | cookie 安全 | **已缓解** | `litellm.locale` 非敏感，SameSite=Lax + 生产 Secure（localePreferences.ts） |
| R9 | 硬编码文案漏网 | **部分缓解 / 仍开放** | v1 范围内 scan 命中已清零（Wave 3 修复后）；**遗留 D-6**：/usage 共享组件（SavingsTiles、UsageExportHeader 等）仍有英文，A0 裁决中 |
| R10 | 无多语言 SEO | **已接受（v1 边界）** | ADR-06 Accepted，title/meta 保持英文 |
| R12 | 中文文本溢出 | **仍开放（低危）** | 静态排查无致命项，A7 留 5 处窄视口人工走查清单（A7 §5） |
| R13 | JSON 资源体积 | **已缓解** | 8 namespace 合计 1110 keys/语言，体积可控；build 51/51 正常 |

---

## 5. 证据汇总表

| 证据项 | 位置 / 命令 | 结果 |
|---|---|---|
| en/zh 键一致性 | `node scripts/i18n/check-keys.mjs` | PASS（8/8，本轮复跑） |
| 字典 key 统计 | 本文 §2.4（node 计数脚本） | en=1110 / zh=1110 |
| 平台测试 | `vitest run --project unit src/i18n/`；`--project integration src/i18n/` | 33 + 7 通过 |
| Wave 3 定向测试 | `npx vitest run "src/app/(dashboard)/usage" .../cost-tracking .../cost-optimization .../budgets` | 649 通过 |
| Wave 1/2 抽查 | A7 报告 §2 | 106 通过 |
| lint | `npm run lint` | 0 error（G3 复验） |
| 静态导出 | `npm run build` | 51/51 路由 |
| 悬空 key 检查 | `node scripts/i18n/check-keys-dangling.mjs "src"` | PASS |
| 硬编码扫描 | `node scripts/i18n/scan-hardcoded.mjs "src/app/(dashboard)/..."` | 范围内 0 用户可见残留 |
| 分支拓扑 | `git log --graph --oneline 31e3a76d3f..HEAD` | 本文 §2.1 |
| 差异规模 | `git diff --stat 31e3a76d3f..HEAD` | 142 files, +8131/−1730 |
| G3 判定 | `W3_A7_REGRESSION_REPORT.md` + TASK_BOARD 修复轮记录 | 修复后 PASS |
