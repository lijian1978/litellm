"use client";

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useInfiniteKeys } from "@/app/(dashboard)/hooks/keys/useKeys";
import { useInfiniteUsers } from "@/app/(dashboard)/hooks/users/useUsers";
import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { useModelCostMap } from "@/app/(dashboard)/hooks/models/useModelCostMap";
import { useAutoRouters, usePlainModelGroups } from "@/app/(dashboard)/hooks/models/useModels";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { PaginatedMultiSelect } from "@/components/shared/PaginatedMultiSelect";
import TeamMultiSelect from "@/components/common_components/team_multi_select";
import { userOptionLabel } from "@/components/common_components/UserDropdown";
import { SearchSelect, type SearchSelectOption } from "@/components/shared/SearchSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useStartShadowEval, type ShadowEvalJob } from "./useShadowEval";

type ShadowEvalDirection = ShadowEvalJob["direction"];

const MAX_ROUTERS = 4;
const MAX_MODELS = 100;

const RECOMMENDED_JUDGE_MODELS = ["anthropic/claude-sonnet-5", "openai/gpt-4o", "gemini/gemini-2.5-pro"] as const;

interface CostMapEntry {
  litellm_provider?: string;
  mode?: string;
}

const useChatModelNames = (): string[] => {
  const { data: costMap } = useModelCostMap();
  return useMemo(() => {
    if (!costMap) return [];
    const chatModels = Object.entries(costMap as Record<string, CostMapEntry>)
      .filter(([, value]) => value?.mode === "chat" && value?.litellm_provider)
      .map(([key, value]) => (key.startsWith(`${value.litellm_provider}/`) ? key : `${value.litellm_provider}/${key}`));
    return [...new Set(chatModels)].toSorted((a, b) => a.localeCompare(b));
  }, [costMap]);
};

const useJudgeModelOptions = (): SearchSelectOption[] => {
  const { t } = useTranslation();
  const chatModels = useChatModelNames();
  return useMemo(() => {
    const pinned: SearchSelectOption[] = RECOMMENDED_JUDGE_MODELS.map((model) => ({
      label: model,
      value: model,
      sublabel: t("cost:optimization.shadowEval.form.recommended"),
    }));
    const pinnedNames = new Set<string>(RECOMMENDED_JUDGE_MODELS);
    const rest = chatModels.filter((model) => !pinnedNames.has(model)).map((model) => ({ label: model, value: model }));
    return [...pinned, ...rest];
  }, [chatModels, t]);
};

const useBaselineModelOptions = (): SearchSelectOption[] => {
  const { t } = useTranslation();
  const configuredGroups = usePlainModelGroups();
  const chatModels = useChatModelNames();
  return useMemo(() => {
    const configured = [...configuredGroups]
      .toSorted((a, b) => a.localeCompare(b))
      .map((model) => ({ label: model, value: model, sublabel: t("cost:optimization.shadowEval.form.configuredHere") }));
    const rest = chatModels
      .filter((model) => !configuredGroups.has(model))
      .map((model) => ({ label: model, value: model }));
    return [...configured, ...rest];
  }, [configuredGroups, chatModels, t]);
};

const DIRECTION_OPTIONS: readonly { value: ShadowEvalDirection; labelKey: string }[] = [
  { value: "forward", labelKey: "cost:optimization.shadowEval.form.directionForward" },
  { value: "reverse", labelKey: "cost:optimization.shadowEval.form.directionReverse" },
] as const;

const DURATION_OPTIONS = [
  { value: "1", labelKey: "cost:optimization.shadowEval.form.days_one" },
  { value: "3", labelKey: "cost:optimization.shadowEval.form.days_other" },
  { value: "7", labelKey: "cost:optimization.shadowEval.form.days_other" },
  { value: "14", labelKey: "cost:optimization.shadowEval.form.days_other" },
  { value: "30", labelKey: "cost:optimization.shadowEval.form.days_other" },
] as const;

const Field: React.FC<{ label: string; htmlFor?: string; className?: string; children: React.ReactNode }> = ({
  label,
  htmlFor,
  className,
  children,
}) => (
  <div className={`space-y-1.5 ${className ?? ""}`}>
    <Label htmlFor={htmlFor} className="text-xs">
      {label}
    </Label>
    {children}
  </div>
);

const KeySelect: React.FC<{ value: string[]; onChange: (tokens: string[]) => void }> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteKeys(50, {
    selectedKeyAlias: search || null,
  });
  const options = useMemo<SearchSelectOption[]>(
    () =>
      (data?.pages ?? [])
        .flatMap((page) => page.keys)
        .map((key) => ({
          label: key.key_alias || key.key_name || key.token,
          value: key.token,
          sublabel: key.token,
        })),
    [data],
  );
  return (
    <PaginatedMultiSelect
      inputId="shadow-eval-key"
      options={options}
      value={value}
      onValueChange={onChange}
      onSearchChange={setSearch}
      onLoadMore={() => void fetchNextPage()}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isPending}
      placeholder={t("cost:optimization.shadowEval.form.searchKeys")}
      emptyText={t("cost:optimization.shadowEval.form.noMatchingKeys")}
      errorText={isError ? t("cost:optimization.shadowEval.form.keysLoadFailed") : undefined}
    />
  );
};

const UserSelect: React.FC<{ value: string[]; onChange: (ids: string[]) => void }> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteUsers(
    50,
    search || undefined,
  );
  const options = useMemo<SearchSelectOption[]>(
    () =>
      Array.from(
        new Map(
          (data?.pages ?? [])
            .flatMap((page) => page.users)
            .map((user) => [user.user_id, { label: userOptionLabel(user), value: user.user_id }] as const),
        ).values(),
      ),
    [data],
  );
  return (
    <PaginatedMultiSelect
      inputId="shadow-eval-user"
      options={options}
      value={value}
      onValueChange={onChange}
      onSearchChange={setSearch}
      onLoadMore={() => void fetchNextPage()}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isPending}
      placeholder={t("cost:optimization.shadowEval.form.searchUsers")}
      emptyText={t("cost:optimization.shadowEval.form.noMatchingUsers")}
      errorText={isError ? t("cost:optimization.shadowEval.form.usersLoadFailed") : undefined}
    />
  );
};

const RouterField: React.FC<{
  options: SearchSelectOption[];
  routerNames: string[];
  onChange: (names: string[]) => void;
  direction: ShadowEvalDirection;
}> = ({ options, routerNames, onChange, direction }) => {
  const { t } = useTranslation();
  return (
  <Field label={t("cost:optimization.shadowEval.form.autoRouters")}>
    <MultiSelect
      options={options}
      value={routerNames}
      onValueChange={onChange}
      placeholder={t("cost:optimization.shadowEval.form.selectUpTo4Routers")}
      emptyText={t("cost:optimization.shadowEval.form.noAutoRouters")}
    />
    {routerNames.length > MAX_ROUTERS && (
      <p className="text-xs text-destructive">{t("cost:optimization.shadowEval.form.maxRouters", { count: MAX_ROUTERS })}</p>
    )}
    {direction === "reverse" && routerNames.length > 1 && (
      <p className="text-xs text-destructive">{t("cost:optimization.shadowEval.form.regressionSingleRouter")}</p>
    )}
    {direction === "forward" && routerNames.length > 1 && (
      <p className="text-xs text-muted-foreground">
        {t("cost:optimization.shadowEval.form.sameSampledRequests")}
      </p>
    )}
  </Field>
  );
};

interface StartFormValidityInputs {
  accessToken: string | null | undefined;
  apiKeyIds: string[];
  teamIds: string[];
  userIds: string[];
  models: string[];
  routerNames: string[];
  direction: ShadowEvalDirection;
  baselineModel: string;
  judgeModel: string;
  percentage: string;
  maxBudget: string;
}

const startFormValidity = (inputs: StartFormValidityInputs) => {
  const parsedPct = Number.parseFloat(inputs.percentage);
  const percentageValid = parsedPct >= 0.1 && parsedPct <= 100;
  const parsedMaxBudget = Number.parseFloat(inputs.maxBudget);
  const maxBudgetValid = parsedMaxBudget >= 0.01 && parsedMaxBudget <= 10000;
  const baselinePicked = inputs.direction === "forward" || inputs.baselineModel !== "";
  const targetsPicked = inputs.apiKeyIds.length + inputs.teamIds.length + inputs.userIds.length > 0;
  const routerCountValid = inputs.routerNames.length >= 1 && inputs.routerNames.length <= MAX_ROUTERS;
  const routersMatchDirection = inputs.direction === "forward" || inputs.routerNames.length === 1;
  const routersValid = routerCountValid && routersMatchDirection;
  const scopeValid = routersValid && (inputs.direction === "reverse" || inputs.models.length <= MAX_MODELS);
  const modelsPicked = scopeValid && inputs.judgeModel !== "" && baselinePicked;
  const filled = targetsPicked && modelsPicked;
  const boundsValid = percentageValid && maxBudgetValid;
  const valid = Boolean(inputs.accessToken) && filled && boundsValid;
  return { parsedPct, parsedMaxBudget, percentageValid, maxBudgetValid, valid };
};

interface StartBodyInputs {
  apiKeyIds: string[];
  teamIds: string[];
  userIds: string[];
  models: string[];
  routerNames: string[];
  direction: ShadowEvalDirection;
  baselineModel: string;
  shadowPercentage: number;
  durationDays: number;
  maxBudget: number;
  judgeModel: string;
}

const buildStartBody = (inputs: StartBodyInputs) => ({
  api_key_ids: inputs.apiKeyIds,
  team_ids: inputs.teamIds,
  user_ids: inputs.userIds,
  models: inputs.direction === "forward" ? inputs.models : [],
  router_names: inputs.routerNames,
  direction: inputs.direction,
  ...(inputs.direction === "reverse" ? { baseline_model: inputs.baselineModel } : {}),
  shadow_percentage: inputs.shadowPercentage,
  duration_days: inputs.durationDays,
  max_budget: inputs.maxBudget,
  judge_model: inputs.judgeModel,
});

export const StartForm: React.FC = () => {
  const { t } = useTranslation();
  const { accessToken } = useAuthorized();
  const [apiKeyIds, setApiKeyIds] = useState<string[]>([]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [routerNames, setRouterNames] = useState<string[]>([]);
  const [direction, setDirection] = useState<ShadowEvalDirection>("forward");
  const [baselineModel, setBaselineModel] = useState("");
  const [percentage, setPercentage] = useState("10");
  const [durationDays, setDurationDays] = useState("7");
  const [judgeModel, setJudgeModel] = useState("");
  const [maxBudget, setMaxBudget] = useState("10");
  const { data: autoRouters } = useAutoRouters();
  const judgeModelOptions = useJudgeModelOptions();
  const baselineModelOptions = useBaselineModelOptions();
  const configuredGroups = usePlainModelGroups();
  const modelOptions = useMemo<SearchSelectOption[]>(
    () => [...configuredGroups].toSorted((a, b) => a.localeCompare(b)).map((name) => ({ label: name, value: name })),
    [configuredGroups],
  );
  const start = useStartShadowEval();

  const routerOptions = useMemo<SearchSelectOption[]>(() => {
    const names = new Set(
      (autoRouters ?? []).map((deployment) => deployment.model_name).filter((name): name is string => Boolean(name)),
    );
    return [...names].toSorted().map((name) => ({ label: name, value: name }));
  }, [autoRouters]);

  const validityInputs: StartFormValidityInputs = {
    accessToken,
    apiKeyIds,
    teamIds,
    userIds,
    models,
    routerNames,
    direction,
    baselineModel,
    judgeModel,
    percentage,
    maxBudget,
  };
  const { parsedPct, parsedMaxBudget, percentageValid, maxBudgetValid, valid } = startFormValidity(validityInputs);
  const handleStart = () => {
    const bodyInputs: StartBodyInputs = {
      apiKeyIds,
      teamIds,
      userIds,
      models,
      routerNames,
      direction,
      baselineModel,
      shadowPercentage: parsedPct,
      durationDays: Number.parseInt(durationDays, 10),
      maxBudget: parsedMaxBudget,
      judgeModel,
    };
    start.mutate(buildStartBody(bodyInputs));
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-foreground">{t("cost:optimization.shadowEval.form.startTitle")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t(`cost:optimization.shadowEval.form.description_${direction}`)}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t("cost:optimization.shadowEval.form.direction")}>
            <Select
              value={direction}
              onValueChange={(v: string | null) => setDirection(v === "reverse" ? "reverse" : "forward")}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{DIRECTION_OPTIONS.find((o) => o.value === direction) && t(DIRECTION_OPTIONS.find((o) => o.value === direction)!.labelKey)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DIRECTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("cost:optimization.shadowEval.form.keysToShadow")} htmlFor="shadow-eval-key">
            <KeySelect value={apiKeyIds} onChange={setApiKeyIds} />
          </Field>
          <Field label={t("cost:optimization.shadowEval.form.teamsToShadow")}>
            <TeamMultiSelect value={teamIds} onChange={setTeamIds} placeholder={t("cost:optimization.shadowEval.form.searchTeams")} />
          </Field>
          <Field label={t("cost:optimization.shadowEval.form.usersToShadow")} htmlFor="shadow-eval-user">
            <UserSelect value={userIds} onChange={setUserIds} />
          </Field>
          {direction === "forward" && (
            <Field label={t("cost:optimization.shadowEval.form.onlyOnModels")}>
              <MultiSelect
                options={modelOptions}
                value={models}
                onValueChange={setModels}
                placeholder={t("cost:optimization.shadowEval.form.everyModel")}
                emptyText={t("cost:optimization.shadowEval.form.noModels")}
              />
              {models.length > MAX_MODELS ? (
                <p className="text-xs text-destructive">{t("cost:optimization.shadowEval.form.maxModels", { count: MAX_MODELS })}</p>
              ) : (
                <p className="text-xs text-muted-foreground">{t("cost:optimization.shadowEval.form.narrowsTargets")}</p>
              )}
            </Field>
          )}
          <RouterField
            options={routerOptions}
            routerNames={routerNames}
            onChange={setRouterNames}
            direction={direction}
          />
          <Field label={t("cost:optimization.shadowEval.form.trafficSampled")} htmlFor="shadow-eval-pct">
            <div className="flex items-center gap-2">
              <Input
                id="shadow-eval-pct"
                type="number"
                min={0.1}
                max={100}
                step={0.1}
                className="w-24"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">{t("cost:optimization.shadowEval.form.pctOfTraffic")}</span>
            </div>
            <div>
              {percentage.trim() !== "" && !percentageValid && (
                <p className="text-xs text-destructive">{t("cost:optimization.shadowEval.form.pctRange")}</p>
              )}
            </div>
          </Field>
          <Field label={t("cost:optimization.shadowEval.form.duration")}>
            <Select value={durationDays} onValueChange={(v: string | null) => setDurationDays(v ?? "7")}>
              <SelectTrigger className="w-full">
                <SelectValue>{t("cost:optimization.shadowEval.form.days", { count: Number.parseInt(durationDays, 10) })}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t("cost:optimization.shadowEval.form.days", { count: Number.parseInt(option.value, 10) })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("cost:optimization.shadowEval.form.spendBudget")}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                min={0.01}
                max={10000}
                step={0.01}
                className="w-24"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">{t("cost:optimization.shadowEval.form.maxSpendHint")}</span>
            </div>
            {maxBudget.trim() !== "" && !maxBudgetValid && (
              <p className="text-xs text-destructive">{t("cost:optimization.shadowEval.form.budgetRange")}</p>
            )}
          </Field>
          {direction === "reverse" && (
            <Field label={t("cost:optimization.shadowEval.form.baselineModel")}>
              <SearchSelect
                options={baselineModelOptions}
                value={baselineModel}
                onValueChange={setBaselineModel}
                placeholder={t("cost:optimization.shadowEval.form.selectBaseline")}
                emptyText={t("cost:optimization.shadowEval.form.noChatModels")}
              />
            </Field>
          )}
          <Field label={t("cost:optimization.shadowEval.form.judgeModel")} className="sm:col-span-2">
            <SearchSelect
              options={judgeModelOptions}
              value={judgeModel}
              onValueChange={setJudgeModel}
              placeholder={t("cost:optimization.shadowEval.form.selectJudge")}
              emptyText={t("cost:optimization.shadowEval.form.noChatModels")}
            />
          </Field>
        </div>
        <Button disabled={!valid || start.isPending} onClick={handleStart}>
          {start.isPending ? t("cost:optimization.shadowEval.form.starting") : t("cost:optimization.shadowEval.form.startButton")}
        </Button>
      </CardContent>
    </Card>
  );
};
