# Wave 4A 术语与中文体验复核报告（Agent 2, localization-designer）

> 分支：`i18n/w1-integration` @ `d86563017a`（只读复核，未改产品代码/字典）
> 范围：`src/locales/zh-CN/` 全部 8 个 namespace（1110 条）逐条术语对照 + 中文质量抽查（每 namespace ≥30%）+ D-6 共享组件可见性走查 + 标点/数字静态检查
> 输入：GLOSSARY_EN_ZH.md（63 条）、LOCALIZATION_SPEC.md、W3_A7_REGRESSION_REPORT.md、TASK_BOARD.md

---

## 1. 术语符合度结论

**总体判定：符合率约 93%（63 条术语表中 59 条在字典中落地正确，4 条存在偏差/无法完全验证）。无 P0、无 P1 级术语违规；发现的偏差全部为 P2/P3。**

高频词跨 namespace 一致性抽查结果（common/navigation/auth/models/apiKeys/usage/cost/budgets）：

| 词 | 各 namespace 译法 | 结论 |
|---|---|---|
| spend | 花费（usage 全部、budgets、apiKeys.columns.spend、models.sharedSpend 共享花费） | ✅ 一致，未出现"支出/消耗"漂移 |
| cost | 成本（usage.tabCost、cost.json 全部、models.columns.costs） | ✅ 花费/成本区分正确落地 |
| token | Token 不译（usage totalTokens "总 Token 数"、budgets tpm "每分钟最大 Token 数"、cost 定价/明细） | ✅ 一致 |
| provider | 提供商（usage/cost/models/apiKeys.scimBlockedTooltip） | ✅ 全站统一，无"供应商" |
| team / organization / user | 团队 / 组织 / 用户（含 navigation.item） | ✅ |
| virtual key / API key | 虚拟密钥 / API 密钥语义（navigation.virtualKeys、usage.topVirtualKeys、apiKeys.page.title） | ✅ |
| budget limit | 预算上限（budgets 多处、models.accessGroupBudget.maxBudget） | ✅ |
| filter / export / refresh | 筛选 / 导出 / 刷新 | ✅ |
| delete / remove | 删除 / 移除（budgets delete.* vs cost remove.*） | ✅ 按表区分，未混用 |
| enable / disable | 启用 / 停用（cost.compression.alwaysOn 始终启用、auth adminDisabledTitle） | ✅ |
| router / proxy | 网关 / 代理（navigation.routerSettings 网关设置、apiKeys.subtitle "向网关认证"、models.page.subtitle.admin "为代理添加"、cost "代理管理员"） | ✅ 语义分配正确 |
| deployment / endpoint | 部署 / 端点 | ✅ |
| loading… | 加载中…（common.loading.ellipsis；各 namespace 变体"正在加载…/加载中…"） | ✅（但见 P2-1 半角残留） |
| all（筛选器） | 全部 / 不限（budgets.filters.any 用"不限"表 Any，语义正确） | ✅ |

4 条有保留意见的词条：

1. **Margin（加价）**：`cost.json` margins 全组用"加价"，与字典组内一致，但组标题 `cost:margins.title` 仍为"**费用/价格加价**"，加价叠床架屋（见 §3 P2-2 —— D-7 修复轮声称已改名，实际未改）。
2. **Agent / Prompt**：按表保留英文（usage "Agent 活动"、cost "Prompt 压缩/缓存"、navigation.pageDesc），未擅自译"智能体"，✅ 符合；仅 `usage:pageDesc.agentic` 一处中英密度略高（"管理 Agent 相关资源：Agents、工作流运行与记忆"），可接受。
3. **Playground / Skills / Guardrails**：按 V1 范围保留英文（navigation.item.playground/skills/guardrails）✅。
4. **month / this month → 本月**：字典中无直接对应键（budgets 重置周期用"每天/每周/每月"，usage 用"该时间段内"），未发现"此月/当月"漂移，✅ 视为不适用。

复数形态：`_one/_other` 成对出现在 count 插值处（usage.andMore、cost autoRouter.turnsCount/sessionsCount/maxRouters、export.modelsConfigured、tierTurns.totalTurns、shadowEval 多处）。`auth:connectFlow.toolsCount`（"有 {{count}} 个工具可用"）与 `connectFlow.tab.connected`（"已连接{{count}}"）无复数键但 en 侧亦无，插值安全。

## 2. 中文质量抽查（每 namespace ≥30%，共抽查约 420 条）

**总体质量高：无逐字直译硬伤，插值位置全部符合中文语序（动词前置于宾语、量词"个/轮/次"使用得当），技术词保留（API、URL、SSO、JWT、SSO、UTC、TTL、LLM、MCP、A2A）恰当，按钮长度均 ≤8 字无溢出风险。** 质量亮点：cost.json shadowEval/优化说明长句（如 cacheLeakage.potentialSavingsInfo、autoRouter.comparisonHint）译文准确且通顺，明显经过人工润色。

发现的问题（按严重度见 §3 P2-4/P3 组）：
- `usage:aiChat.emptyPrompt` "提问关于你的用量" —— 翻译腔（"关于"直译 about），建议"询问你的用量相关问题"。
- `auth:connectFlow.tab.connected` "已连接{{count}}" —— 缺量词与分隔，紧贴数字，建议"已连接（{{count}}）"或"已连接 {{count}} 个"。
- `auth:login.defaultCredsBody` "密码是你设置的 LiteLLM Proxy<code2>{{masterKeyValue}}</code2>" —— zh 忠实复刻了一个本身不通顺的 en 源串（en: "Password is your set LiteLLM Proxy {{masterKeyValue}}"，缺 "Master Key" 名词），属于源文案缺陷在 zh 的放大，建议在 Wave 4B 一并改 en+zh。
- `models:page.tab.priceData` "价格数据重新加载"（en "Price Data Reload"）—— 名词+动词堆叠生硬，建议"价格数据重载"。
- `cost:calculator.noPricingData` "请在 config 中设置 base_model" —— 同一概念在 models.json 作"配置文件"，此处留英文 config，轻微不一致（代码语境保留可接受，建议统一"配置文件（config）"或至少组内一致）。

## 3. 问题清单（按严重度排序）

### P2（应进 Wave 4B 修复轮）

| ID | 位置 | 问题 |
|---|---|---|
| P2-1 | `zh-CN/apiKeys.json: loadingKey/loadingKeys`、`zh-CN/auth.json: login.submitting / connectFlow.loadingTools / connectFlow.searchPlaceholder`、`zh-CN/models.json: accessGroupBudget.form.saving` | **半角省略号残留（6 处）**。D-7 只修了 usage/cost（Wave 3 目录），Wave 1/2 的 auth/apiKeys/models 未同步。与 common.loading.ellipsis "加载中…" 及 GLOSSARY "Loading… 加载中…" 不一致。机械替换 `...`→`…` 即可 |
| P2-2 | `zh-CN/cost.json: margins.title` = "费用/价格加价" | D-7 修复轮 commit `d8fdf92d37` 信息声称 "rename margins.title to the glossary term 加价"，**实际 diff 未包含该键**，修复未落地。建议改为"加价（Margin）"或"费用加成"，消除"加价"叠用 |
| P2-3 | `zh-CN/usage.json: viewSelect.agentUsage` = "Agent 用量 (A2A)" | 半角括号；同 namespace 其他标签用全角（如 budgets "预算上限（USD）"）。D-7 报告 P2-5 项亦未随修复落地 |
| P2-4 | `src/components/shared/table_cells/date_cell.tsx`（DateCell，全站 30+ 表格使用，含 v1 范围的 budgets "创建时间"列、models AutoRouters/ModelsTableColumns、VirtualKeysPage keyTableColumns） | 日期格式硬编码英文（"Sep 9, 2026"、英文月份缩写、时区名），**不随 locale 切换**。zh 界面所有日期单元格保持英文格式。属于 D-6 同级的共享格式化缺陷，建议 Wave 4B 用 `Intl.DateTimeFormat(appLocale, …)` 改造（此为代码改动非字典改动，需 A0 排期确认归属） |

### P3（记录在案，可接受或低优先）

| ID | 位置 | 问题 |
|---|---|---|
| P3-1 | `usage:aiChat.emptyPrompt` | 翻译腔"提问关于你的用量"（见 §2） |
| P3-2 | `auth:connectFlow.tab.connected` | "已连接{{count}}" 缺量词/括号 |
| P3-3 | `auth:login.defaultCredsBody` | en 源串本身缺陷（缺 "Master Key" 名词），zh 忠实放大；建议 en/zh 双改 |
| P3-4 | `models:page.tab.priceData` | "价格数据重新加载" 生硬 |
| P3-5 | `cost:calculator.noPricingData` | "config" 与他处"配置文件"不一致 |
| P3-6 | `auth:connectFlow.emptyNoServer`、`cost:optimization.autoRouter.buckets.*Sub` | ASCII 箭头 `->`；界面他处未出现"→"，两处内部一致，可接受，若统一建议改"→" |
| P3-7 | `src/components/activity_metrics.tsx:432` | `total_requests.toLocaleString()` 跟随浏览器 locale 而非应用 locale，语言切换后数字千分位可能不跟随；影响极小 |

**数字/货币格式核查结论**：金额统一经 `MoneyCell → getSpendString/formatNumberWithCommas`（$ 定制格式，tabular-nums 右对齐），无逐处硬编码格式；USD 货币在 zh 界面保留 `$` 符合规范；无百分比硬编码格式问题（cost 折扣/命中率均插值 `%` 后缀）。除 P3-7 外数字链路无缺陷。

## 4. D-6 裁决建议清单（共享组件英文，按中文界面可见频率排序）

走查方式：静态追踪消费链路（哪些页面渲染哪些组件）。/usage 主视图 `UsagePageView.tsx` 同时渲染下列大部分组件，/usage 是 v1 核心页面，因此以下组件在中文界面**实际高频可见**。

| 序 | 组件 | 消费页面（v1 范围？） | 中文可见度 | 裁决建议 |
|---|---|---|---|---|
| 1 | **ActivityMetrics**（`src/components/activity_metrics.tsx`） | /usage 模型活动、密钥活动、MCP 活动三个标签页正文（UsagePageView:907/910/913） | **高**：三个主标签页的整段卡片（"X requests"、"Unknown Item"、折叠区指标标签全英文） | **值得修**。可见面积最大，直接破坏中文体验；建议纳入 4B |
| 2 | **UsageExportHeader**（`src/components/EntityUsageExport/UsageExportHeader.tsx`） | /usage 所有 EntityUsage 标签页页头（EntityUsage.tsx:29） | **高**："No options found" 及导出控件文案 | **值得修**（至少 ComboboxEmpty 一行 + 按钮 label） |
| 3 | **ModelViewToggle**（`usage/_components/components/ModelViewToggle.tsx`） | /usage 模型活动/密钥活动切换器（UsagePageView:835/905） | **中高**："Public Model Name" / "Litellm Model Name" 常驻 toggle，字符串就在本文件、易改 | **值得修**（成本极低，两个 label） |
| 4 | **TopKeyView**（`src/components/UsagePage/components/EntityUsage/TopKeyView.tsx`） | /usage 密钥活动页（UsagePageView:803）；另被 /old-usage 用（范围外） | **中**：aria "Show fewer tags"/"Close"/"Number of top keys to show"，部分为 aria 仅读屏可见 | **折中**：修可见的 title/aria（3 行），工作量小 |
| 5 | **ViewUserSpend**（`src/components/view_user_spend.tsx`） | /usage 用户视图（UsagePageView:562） | **中**："Team Models"、"$X limit / No limit" 用户可见 | **值得修**（约 3-4 条字符串） |
| 6 | **UserAgentActivity**（`src/components/user_agent_activity.tsx`） | /usage（UsagePageView:45 import） | **中低**："All User Agents"、"No user agents found" 等 | **可修可不修**：字数少，若做 1-3 时顺手带上 |
| 7 | **SavingsTiles**（`src/components/shared/SavingsTiles.tsx`） | /cost-optimization UsageTab + KeySavingsTab（模板，虚拟密钥详情） | **中低**："Total saved"、"Loading..."、长 info 提示英文 | **可接受留英文（暂缓）**：KeySavingsTab 在虚拟密钥详情二级 tab、UsageTab 为成本优化二级 tab，曝光低于 1-3；且 info 文案技术密度高、翻译收益低。建议 4B 仅修 label/hint 三个短串，info 可保留 |
| 8 | **DateCell/MoneyCell**（`src/components/shared/table_cells/`） | 全站 30+ 表格（含 v1：budgets/models/api-keys） | **高（DateCell 格式）** | 见 P2-4：DateCell 日期格式建议修；MoneyCell $ 数字格式对 zh 无违和，**可接受不修** |
| 9 | **getBudgetDurationLabel**（`src/components/common_components/budget_duration_dropdown.tsx:54`） | /budgets 表格已改走 budgets keys（D-1 已修）；剩余消费方 Teams.tsx:279、TeamSSOSettings.tsx:264、user_info_view.tsx:663 均在 **v1 范围外**（teams/users 页） | 范围外 | **可接受**：不修（与 V1_TRANSLATION_SCOPE 一致）；若后续 teams 页进范围再处理 |
| 10 | **budgetFilters 标签**（`budgets/_components/budgetFilters.ts`） | /budgets 筛选抽屉（BudgetTable.tsx） | 低（D-1 修复后标签已走 `budgets:table.filters.*`，budgetFilters.ts 仅余数据结构） | **无需修**，确认关闭 |

优先级总结（给 Wave 4B）：**1 ActivityMetrics → 2 UsageExportHeader → 3 ModelViewToggle → 5 ViewUserSpend → 4 TopKeyView（可见串）**；7/8(SavingsTiles/DateCell)/9/10 按上表裁决。1-5 全部位于 /usage 页，可作为一个"usage 共享组件收尾"原子任务交给 6A。

## 5. 中文体验总体评价

- **质量水位**：8 个 namespace 共 1110 条，无原始 key 泄漏、无 P0。Wave 3（usage/cost/budgets）译文接近人工润色水平；Wave 1/2（auth/models/apiKeys）整体扎实，仅个别生硬。en/zh key 集与插值此前 check-keys 已 PASS，本次未见新漂移。
- **术语纪律**：63 条术语表执行良好，跨 namespace 高频词零漂移，这是本轮最重要的正面结论。
- **遗留短板集中在两点**：① 共享组件英文（D-6，本报告给出裁决清单，主体在 /usage）；② 标点收尾不彻底（D-7 声称已修但 cost margins.title、usage "(A2A)" 与 Wave 1/2 目录的 6 处半角省略号漏网）。
- **建议**：Wave 4B 以"usage 共享组件收尾 + 标点/format 收尾（全目录 grep `\.\.\.` 与半角括号）+ DateCell locale 化立项"三件事为范围即可达到 v1 验收水位；其余 P3 记录不阻塞。

---

*Agent 2（localization-designer），Wave 4A，2026-09-09。只读复核，未改动产品代码与字典。*
