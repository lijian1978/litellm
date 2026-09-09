/**
 * Page metadata for UI Settings configuration
 * This file contains descriptions and metadata for all navigation pages.
 *
 * R1 seam: `pageDescriptions` values are i18n key refs (`navigation:pageDesc.*`)
 * so the UI Settings visibility list renders localized, translated by consumers
 * via t(). Keys match the `navigation.json` `pageDesc` block exactly.
 */

// Page descriptions for UI Settings configuration (as i18n keys, §4 en as source)
export const pageDescriptions: Record<string, string> = {
  "api-keys": "navigation:pageDesc.api-keys",
  "llm-playground": "navigation:pageDesc.llm-playground",
  models: "navigation:pageDesc.models",
  agents: "navigation:pageDesc.agents",
  agentic: "navigation:pageDesc.agentic",
  workflows: "navigation:pageDesc.workflows",
  "mcp-servers": "navigation:pageDesc.mcp-servers",
  memory: "navigation:pageDesc.memory",
  guardrails: "navigation:pageDesc.guardrails",
  policies: "navigation:pageDesc.policies",
  "search-tools": "navigation:pageDesc.search-tools",
  "tool-policies": "navigation:pageDesc.tool-policies",
  "vector-stores": "navigation:pageDesc.vector-stores",
  new_usage: "navigation:pageDesc.new_usage",
  "cost-optimization": "navigation:pageDesc.cost-optimization",
  logs: "navigation:pageDesc.logs",
  "guardrails-monitor": "navigation:pageDesc.guardrails-monitor",
  users: "navigation:pageDesc.users",
  teams: "navigation:pageDesc.teams",
  organizations: "navigation:pageDesc.organizations",
  projects: "navigation:pageDesc.projects",
  "access-groups": "navigation:pageDesc.access-groups",
  budgets: "navigation:pageDesc.budgets",
  api_ref: "navigation:pageDesc.api_ref",
  "model-hub-table": "navigation:pageDesc.model-hub-table",
  "learning-resources": "navigation:pageDesc.learning-resources",
  caching: "navigation:pageDesc.caching",
  "transform-request": "navigation:pageDesc.transform-request",
  "cost-tracking": "navigation:pageDesc.cost-tracking",
  "ui-theme": "navigation:pageDesc.ui-theme",
  "tag-management": "navigation:pageDesc.tag-management",
  prompts: "navigation:pageDesc.prompts",
  skills: "navigation:pageDesc.skills",
  usage: "navigation:pageDesc.usage",
  "router-settings": "navigation:pageDesc.router-settings",
  "logging-and-alerts": "navigation:pageDesc.logging-and-alerts",
  "admin-panel": "navigation:pageDesc.admin-panel",
};

export interface PageMetadata {
  page: string;
  /** i18n key for the page label (`navigation:item.*`) */
  label: string;
  /** i18n key (or `Group > Parent` key composite) for the section label (`navigation:group.*` / `navigation:item.*`) */
  group: string;
  /** i18n key for the page description (`navigation:pageDesc.*`) */
  description: string;
}
