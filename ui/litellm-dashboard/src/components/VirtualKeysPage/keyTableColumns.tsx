"use client";

import { Info } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { DataTableMultiSortHeader, DataTableSortHeader } from "@/components/shared/DataTable";
import { inheritedBudgetGates } from "@/components/shared/InheritedBudgetHint";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DateCell,
  IdCell,
  IdentityCell,
  ModelsCell,
  SpendBudgetCell,
  StatusBadge,
  type StatusTone,
} from "@/components/shared/table_cells";

import DefaultProxyAdminTag from "../common_components/DefaultProxyAdminTag";
import { KeyResponse, Team } from "../key_team_helpers/key_list";
import { Organization } from "../networking";

interface KeyStatus {
  tone: StatusTone;
  label: string;
  tooltip?: string;
}

export const KEY_TABLE_SORT_FIELDS: readonly string[] = [
  "key_alias",
  "token",
  "created_at",
  "updated_at",
  "spend",
  "max_budget",
];

const getKeyStatus = (key: KeyResponse, t: (key: string, options?: Record<string, unknown>) => string): KeyStatus => {
  if (key.blocked === true) {
    const isScimBlocked = (key.metadata as Record<string, unknown> | null | undefined)?.scim_blocked === true;
    return {
      tone: "error",
      label: t("apiKeys:status.blocked"),
      tooltip: isScimBlocked ? t("apiKeys:status.scimBlockedTooltip") : t("apiKeys:status.blockedTooltip"),
    };
  }
  const expiresAt = key.expires ? Date.parse(key.expires) : Number.NaN;
  if (!Number.isNaN(expiresAt) && expiresAt < Date.now()) {
    return { tone: "warning", label: t("apiKeys:status.expired"), tooltip: t("apiKeys:status.expiredTooltip") };
  }
  return {
    tone: "success",
    label: t("apiKeys:status.active"),
    tooltip: t("apiKeys:status.activeTooltip"),
  };
};

const UserPopoverCell = ({
  userAlias,
  userEmail,
  userId,
  width,
}: {
  userAlias: string | null;
  userEmail: string | null;
  userId: string | null;
  width: number;
}) => {
  const displayValue = userAlias || userEmail || userId;
  const isDefaultAdmin = userId === "default_user_id";
  const { t } = useTranslation();

  const userLabels = [
    { labelKey: "apiKeys:userInfo.alias", value: userAlias },
    { labelKey: "apiKeys:userInfo.email", value: userEmail },
    { labelKey: "apiKeys:userInfo.id", value: userId },
  ];

  const popoverContent = (
    <div className="flex flex-col gap-2 text-xs min-w-[200px] max-w-[300px]">
      {userLabels.map(({ labelKey, value }) => (
        <div key={labelKey} className="flex flex-col min-w-0">
          <span className="text-muted-foreground">{t(labelKey)}</span>
          {value ? (
            <IdCell value={value} variant="plain" copyable className="max-w-full" />
          ) : (
            <span className="font-mono">-</span>
          )}
        </div>
      ))}
    </div>
  );

  if (isDefaultAdmin && !userAlias && !userEmail) {
    return (
      <HoverCard>
        <HoverCardTrigger render={<span className="cursor-default" />}>
          <DefaultProxyAdminTag userId={userId} />
        </HoverCardTrigger>
        <HoverCardContent align="start">{popoverContent}</HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <span
            className="font-mono text-xs truncate block cursor-default"
            style={{ maxWidth: width, overflow: "hidden" }}
          />
        }
      >
        {displayValue || "-"}
      </HoverCardTrigger>
      <HoverCardContent align="start">{popoverContent}</HoverCardContent>
    </HoverCard>
  );
};

const InfoHeader = ({ label, tooltip }: { label: string; tooltip: string }) => {
  const { t } = useTranslation();
  return (
    <span className="flex items-center gap-1">
      {t(label)}
      <HoverCard>
        <HoverCardTrigger render={<Info className="size-3 text-muted-foreground cursor-help" />} />
        <HoverCardContent className="w-auto">{t(tooltip)}</HoverCardContent>
      </HoverCard>
    </span>
  );
};

interface KeyTableColumnsDeps {
  allTeams: Team[];
  organizations: Organization[];
  onSelectKey: (key: KeyResponse) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const getKeyTableColumns = ({
  allTeams,
  organizations,
  onSelectKey,
  t,
}: KeyTableColumnsDeps): ColumnDef<KeyResponse>[] => [
  {
    id: "key_alias",
    accessorKey: "key_alias",
    meta: {
      title: t("apiKeys:columns.key"),
      renderSkeleton: () => (
        <div className="flex flex-col gap-1 py-1">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ),
    },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("apiKeys:columns.key")} variant="header-cycle" />,
    size: 260,
    enableSorting: true,
    cell: ({ row }) => {
      const status = getKeyStatus(row.original, t);
      return (
        <IdentityCell
          title={row.original.key_alias || "-"}
          subtitle={row.original.key_name}
          badge={
            <StatusBadge
              tone={status.tone}
              label={status.label}
              tooltip={status.tooltip}
              dataTestId={`key-status-${row.original.token_id}`}
            />
          }
          onClick={() => onSelectKey(row.original)}
        />
      );
    },
  },
  {
    id: "token",
    accessorKey: "token",
    meta: { title: t("apiKeys:columns.keyId") },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("apiKeys:columns.keyId")} variant="header-cycle" />,
    size: 120,
    enableSorting: true,
    cell: (info) => <IdCell value={info.getValue() as string | null} onClick={() => onSelectKey(info.row.original)} />,
  },
  {
    id: "team_alias",
    accessorKey: "team_id",
    meta: { title: t("apiKeys:columns.team") },
    header: t("apiKeys:columns.team"),
    size: 120,
    enableSorting: false,
    cell: (info) => {
      const teamId = info.getValue() as string | null;
      if (!teamId) return "-";
      const team = allTeams.find((t) => t.team_id === teamId);
      const displayValue = team?.team_alias || teamId;
      const width = info.cell.column.getSize();
      return (
        <span className="font-mono text-xs truncate block" style={{ maxWidth: width, overflow: "hidden" }}>
          {displayValue}
        </span>
      );
    },
  },
  {
    id: "organization_alias",
    accessorKey: "org_id",
    meta: { title: t("apiKeys:columns.organization") },
    header: t("apiKeys:columns.organization"),
    size: 140,
    enableSorting: false,
    cell: (info) => {
      const orgId = info.getValue() as string | null;
      if (!orgId) return "-";
      const org = organizations.find((o) => o.organization_id === orgId);
      const displayValue = org?.organization_alias || orgId;
      const width = info.cell.column.getSize();
      return (
        <span className="font-mono text-xs truncate block" style={{ maxWidth: width, overflow: "hidden" }}>
          {displayValue}
        </span>
      );
    },
  },
  {
    id: "user",
    accessorKey: "user",
    meta: { title: t("apiKeys:columns.user") },
    header: () => (
      <InfoHeader label="apiKeys:columns.user" tooltip="apiKeys:columns.userTooltip" />
    ),
    size: 160,
    enableSorting: false,
    cell: ({ row }) => {
      const key = row.original;
      return (
        <UserPopoverCell
          userAlias={key.user?.user_alias ?? null}
          userEmail={key.user?.user_email ?? key.user_email ?? null}
          userId={key.user_id ?? null}
          width={160}
        />
      );
    },
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    meta: { title: t("apiKeys:columns.createdAt") },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("apiKeys:columns.createdAt")} variant="header-cycle" />,
    size: 120,
    enableSorting: true,
    cell: (info) => <DateCell value={info.getValue() as string | null} precision="date" />,
  },
  {
    id: "created_by",
    accessorKey: "created_by",
    meta: { title: t("apiKeys:columns.createdBy") },
    header: t("apiKeys:columns.createdBy"),
    size: 160,
    enableSorting: false,
    cell: (info) => {
      const userId = info.getValue() as string | null;
      if (!userId) return "-";
      const createdByUser = info.row.original.created_by_user;
      return (
        <UserPopoverCell
          userAlias={createdByUser?.user_alias ?? null}
          userEmail={createdByUser?.user_email ?? null}
          userId={userId}
          width={160}
        />
      );
    },
  },
  {
    id: "updated_at",
    accessorKey: "updated_at",
    meta: { title: t("apiKeys:columns.updatedAt") },
    header: ({ column }) => <DataTableSortHeader column={column} title={t("apiKeys:columns.updatedAt")} variant="header-cycle" />,
    size: 120,
    enableSorting: true,
    cell: (info) => <DateCell value={info.getValue() as string | null} precision="date" fallback={t("apiKeys:time.never")} />,
  },
  {
    id: "last_active",
    accessorKey: "last_active",
    meta: { title: t("apiKeys:columns.lastActive") },
    header: () => (
      <InfoHeader label="apiKeys:columns.lastActive" tooltip="apiKeys:columns.lastActiveTooltip" />
    ),
    size: 130,
    enableSorting: false,
    cell: (info) => (
      <DateCell value={info.getValue() as string | null} precision="date" fallback={t("apiKeys:time.unknown")} />
    ),
  },
  {
    id: "expires",
    accessorKey: "expires",
    meta: { title: t("apiKeys:columns.expires") },
    header: t("apiKeys:columns.expires"),
    size: 120,
    enableSorting: false,
    cell: (info) => <DateCell value={info.getValue() as string | null} precision="date" fallback={t("apiKeys:time.never")} />,
  },
  {
    id: "spend",
    accessorKey: "spend",
    meta: { title: t("apiKeys:columns.spendBudget"), skeleton: "meter" },
    header: ({ table }) => (
      <DataTableMultiSortHeader
        table={table}
        fields={[
          { id: "spend", label: t("apiKeys:columns.spend") },
          { id: "max_budget", label: t("apiKeys:columns.budget") },
        ]}
      />
    ),
    size: 180,
    enableSorting: true,
    cell: ({ row }) => {
      const team = allTeams.find((t) => t.team_id === row.original.team_id);
      const orgId = row.original.organization_id || row.original.org_id || team?.organization_id;
      const organization = organizations.find((o) => o.organization_id === orgId);
      return (
        <SpendBudgetCell
          spend={row.original.spend}
          maxBudget={row.original.max_budget}
          inheritedGates={row.original.max_budget == null ? inheritedBudgetGates(team, organization) : []}
        />
      );
    },
  },
  {
    id: "budget_reset_at",
    accessorKey: "budget_reset_at",
    meta: { title: t("apiKeys:columns.budgetReset") },
    header: t("apiKeys:columns.budgetReset"),
    size: 130,
    enableSorting: false,
    cell: (info) => <DateCell value={info.getValue() as string | null} fallback={t("apiKeys:time.never")} />,
  },
  {
    id: "models",
    accessorKey: "models",
    meta: { title: t("apiKeys:columns.models"), skeleton: "chips" },
    header: t("apiKeys:columns.models"),
    size: 220,
    enableSorting: false,
    cell: (info) => (
      <ModelsCell
        models={info.getValue() as string[] | null | undefined}
        allowedRoutes={info.row.original.allowed_routes}
        keyType={info.row.original.key_type}
      />
    ),
  },
  {
    id: "rate_limits",
    meta: { title: t("apiKeys:columns.rateLimits") },
    header: t("apiKeys:columns.rateLimits"),
    size: 140,
    enableSorting: false,
    cell: ({ row }) => {
      const key = row.original;
      return (
        <div className="text-xs">
          <div>
            TPM: {key.tpm_limit !== null ? key.tpm_limit : t("apiKeys:rate.limit.unlimited")}
          </div>
          <div>
            RPM: {key.rpm_limit !== null ? key.rpm_limit : t("apiKeys:rate.limit.unlimited")}
          </div>
        </div>
      );
    },
  },
];

export const KEY_TABLE_HIDDEN_COLUMNS: Record<string, boolean> = {
  token: false,
  organization_alias: false,
  created_by: false,
  updated_at: false,
  expires: false,
  rate_limits: false,
};
