"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DataTableSortHeader } from "@/components/shared/DataTable";
import { ModelsCell, SpendBudgetCell } from "@/components/shared/table_cells";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cva.config";
import { ModelAccessGroup } from "@/app/(dashboard)/hooks/modelAccessGroups/useModelAccessGroups";
import { localizedBudgetDurationLabel } from "@/app/(dashboard)/budgets/_components/BudgetTableColumns";

const budgetDecimals = (maxBudget: number | null | undefined): number =>
  maxBudget != null && maxBudget > 0 && maxBudget < 0.01 ? 5 : 2;

/**
 * A group name is a free-text path segment on the budget routes, so a `/` in it splits the path and
 * no encoding recovers it. Such a group is listed but its budget is unreachable.
 */
export const isBudgetAddressable = (accessGroup: string): boolean => !accessGroup.includes("/");

const writeBlockedReason = (
  accessGroup: ModelAccessGroup,
  canWrite: boolean,
  t: (key: string) => string,
): string | undefined => {
  if (!canWrite) return t("models:accessGroupBudget.adminOnly");
  if (!isBudgetAddressable(accessGroup.access_group)) {
    return t("models:accessGroupBudget.slashBlocked");
  }
  return undefined;
};

interface AccessGroupRowActionsProps {
  accessGroup: ModelAccessGroup;
  canWrite: boolean;
  onSetBudget: (accessGroup: ModelAccessGroup) => void;
  onClearBudget: (accessGroup: ModelAccessGroup) => void;
}

function AccessGroupRowActions({ accessGroup, canWrite, onSetBudget, onClearBudget }: AccessGroupRowActionsProps) {
  const { t } = useTranslation();
  const hasBudget = accessGroup.budget != null;
  const blocked = writeBlockedReason(accessGroup, canWrite, t);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("models:accessGroupBudget.openActionsAria", { group: accessGroup.access_group })}
        data-testid={`access-group-actions-${accessGroup.access_group}`}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-muted-foreground")}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          disabled={blocked !== undefined}
          title={blocked}
          data-testid="access-group-action-set-budget"
          onClick={() => onSetBudget(accessGroup)}
        >
          <Wallet />
          {hasBudget ? t("models:accessGroupBudget.editBudget") : t("models:accessGroupBudget.setBudget")}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={blocked !== undefined || !hasBudget}
          data-testid="access-group-action-clear-budget"
          title={blocked ?? (hasBudget ? undefined : t("models:accessGroupBudget.nothingToClear"))}
          onClick={() => onClearBudget(accessGroup)}
        >
          <Trash2 />
          {t("models:accessGroupBudget.clearBudget")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AccessGroupBudgetColumnsDeps {
  canWrite: boolean;
  onSetBudget: (accessGroup: ModelAccessGroup) => void;
  onClearBudget: (accessGroup: ModelAccessGroup) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const getAccessGroupBudgetColumns = ({
  canWrite,
  onSetBudget,
  onClearBudget,
  t,
}: AccessGroupBudgetColumnsDeps): ColumnDef<ModelAccessGroup>[] => [
  {
    id: "access_group",
    accessorKey: "access_group",
    meta: { title: t("models:accessGroupBudget.columns.accessGroup") },
    header: ({ column }) => (
      <DataTableSortHeader column={column} title={t("models:accessGroupBudget.columns.accessGroup")} />
    ),
    size: 220,
    enableSorting: true,
    cell: ({ row }) => (
      <span className="block max-w-56 truncate font-mono text-xs" title={row.original.access_group}>
        {row.original.access_group}
      </span>
    ),
  },
  {
    id: "models",
    meta: { title: t("models:accessGroupBudget.columns.models"), skeleton: "chips" },
    header: t("models:accessGroupBudget.columns.models"),
    size: 280,
    enableSorting: false,
    cell: ({ row }) => <ModelsCell models={row.original.model_names} />,
  },
  {
    id: "deployment_count",
    accessorKey: "deployment_count",
    meta: { title: t("models:accessGroupBudget.columns.deployments"), numeric: true },
    header: ({ column }) => (
      <DataTableSortHeader column={column} title={t("models:accessGroupBudget.columns.deployments")} />
    ),
    size: 120,
    enableSorting: true,
    cell: ({ row }) => row.original.deployment_count,
  },
  {
    id: "spend",
    accessorKey: "spend",
    meta: { title: t("models:accessGroupBudget.columns.sharedSpend") },
    header: ({ column }) => (
      <DataTableSortHeader column={column} title={t("models:accessGroupBudget.columns.sharedSpend")} />
    ),
    size: 180,
    enableSorting: true,
    cell: ({ row }) => (
      <SpendBudgetCell
        spend={row.original.spend}
        maxBudget={row.original.budget?.max_budget}
        budgetDecimals={budgetDecimals(row.original.budget?.max_budget)}
      />
    ),
  },
  {
    id: "budget_duration",
    meta: { title: t("models:accessGroupBudget.columns.resets") },
    header: t("models:accessGroupBudget.columns.resets"),
    size: 110,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {localizedBudgetDurationLabel(t, row.original.budget?.budget_duration)}
      </span>
    ),
  },
  {
    id: "actions",
    meta: { className: "text-right", headerClassName: "text-right" },
    header: () => <span className="sr-only">{t("models:accessGroupBudget.columns.actions")}</span>,
    size: 64,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AccessGroupRowActions
          accessGroup={row.original}
          canWrite={canWrite}
          onSetBudget={onSetBudget}
          onClearBudget={onClearBudget}
        />
      </div>
    ),
  },
];
