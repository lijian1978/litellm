import { useTranslation } from "react-i18next";
import { BarChart3, Bot, Building2, Globe, LineChart, ShoppingCart, Tags, User, Users } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasCapability, type Capability } from "@/utils/capabilities";
import { all_admin_roles } from "@/utils/roles";
export type UsageOption =
  | "global"
  | "my-usage"
  | "organization"
  | "team"
  | "customer"
  | "tag"
  | "agent"
  | "user"
  | "user-agent-activity";
export interface UsageViewSelectProps {
  value: UsageOption;
  onChange: (value: UsageOption) => void;
  userRole: string | null;
  canViewTagUsage?: boolean;
  isOrgAdmin?: boolean;
  title?: string;
  description?: string;
  "data-id"?: string;
}
interface OptionConfig {
  value: UsageOption;
  label: string;
  description: string;
  icon: React.ReactNode;
  capability?: Capability;
  adminOnly?: boolean;
  showForAdmin?: string;
  showForNonAdmin?: string;
  descriptionForAdmin?: string;
  descriptionForNonAdmin?: string;
  badgeText?: string;
}
const options = (t: (key: string) => string): OptionConfig[] => [
  {
    value: "global",
    label: t("usage:viewSelect.globalUsage"),
    showForAdmin: t("usage:viewSelect.globalUsage"),
    showForNonAdmin: t("usage:viewSelect.yourUsage"),
    description: t("usage:viewSelect.globalDescription"),
    descriptionForAdmin: t("usage:viewSelect.globalDescription"),
    descriptionForNonAdmin: t("usage:viewSelect.yourUsageDescription"),
    icon: <Globe className="size-4" />,
  },
  {
    value: "my-usage",
    label: t("usage:viewSelect.yourUsage"),
    description: t("usage:viewSelect.yourUsageDescription"),
    icon: <User className="size-4" />,
    adminOnly: true,
  },
  {
    value: "organization",
    label: t("usage:viewSelect.organizationUsage"),
    description: t("usage:viewSelect.organizationDescription"),
    icon: <Building2 className="size-4" />,
    capability: "viewOrganizationUsage",
  },
  {
    value: "team",
    label: t("usage:viewSelect.teamUsage"),
    description: t("usage:viewSelect.teamDescription"),
    icon: <Users className="size-4" />,
  },
  {
    value: "customer",
    label: t("usage:viewSelect.customerUsage"),
    description: t("usage:viewSelect.customerDescription"),
    icon: <ShoppingCart className="size-4" />,
    adminOnly: true,
  },
  {
    value: "tag",
    label: t("usage:viewSelect.tagUsage"),
    description: t("usage:viewSelect.tagDescription"),
    icon: <Tags className="size-4" />,
    adminOnly: true,
  },
  {
    value: "agent",
    label: t("usage:viewSelect.agentUsage"),
    description: t("usage:viewSelect.agentDescription"),
    icon: <Bot className="size-4" />,
    capability: "viewAgentUsage",
  },
  {
    value: "user",
    label: t("usage:viewSelect.userUsage"),
    description: t("usage:viewSelect.userDescription"),
    icon: <User className="size-4" />,
    adminOnly: true,
  },
  {
    value: "user-agent-activity",
    label: t("usage:viewSelect.userAgentActivity"),
    description: t("usage:viewSelect.userAgentDescription"),
    icon: <LineChart className="size-4" />,
    adminOnly: true,
  },
  ];
export const UsageViewSelect: React.FC<UsageViewSelectProps> = ({
  value,
  onChange,
  userRole,
  canViewTagUsage = false,
  isOrgAdmin = false,
  title,
  description,
  "data-id": dataId,
}) => {
  const { t } = useTranslation();
  const heading = title ?? t("usage:viewSelect.title");
  const subtitle = description ?? t("usage:viewSelect.subtitle");
  const isAdmin = all_admin_roles.includes(userRole ?? "");
  const getFilteredOptions = () => {
    return options(t).filter((option) => {
      if (option.capability) {
        return hasCapability(userRole, option.capability, isOrgAdmin);
      }
      if (option.value === "tag" && canViewTagUsage) {
        return true;
      }
      if (option.adminOnly && !isAdmin) {
        return false;
      }
      return true;
    }).map((option) => {
      let label = option.label;
      let desc = option.description;
      if (option.showForAdmin && option.showForNonAdmin) {
        label = isAdmin ? option.showForAdmin : option.showForNonAdmin;
      }
      if (option.descriptionForAdmin && option.descriptionForNonAdmin) {
        desc = isAdmin ? option.descriptionForAdmin : option.descriptionForNonAdmin;
      }
      return {
        value: option.value,
        label,
        description: desc,
        icon: option.icon,
        badgeText: option.badgeText,
      };
    });
  };
  const filteredOptions = getFilteredOptions();
  const selectedOption = filteredOptions.find((option) => option.value === value);
  return (
    <div className="w-full" data-id={dataId}>
      <div className="flex flex-wrap items-center justify-start gap-4">
        <div className="flex items-stretch gap-2 min-w-0">
          <div className="shrink-0 flex items-center">
            <BarChart3 className="size-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-0.5 leading-tight">{heading}</h3>
            <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
          </div>
        </div>
        <div className="shrink-0">
          <Select
            value={value}
            onValueChange={(next: UsageOption | null) => {
              if (next) onChange(next);
            }}
          >
            <SelectTrigger className="w-54 sm:w-64 md:w-72">
              <SelectValue>
                {selectedOption && (
                  <span className="flex items-center gap-2">
                    {selectedOption.icon}
                    <span className="text-sm">{selectedOption.label}</span>
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2 py-1">
                    <span className="shrink-0 mt-0.5">{option.icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-foreground">{option.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{option.description}</span>
                    </span>
                    {option.badgeText && <Badge>{option.badgeText}</Badge>}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
