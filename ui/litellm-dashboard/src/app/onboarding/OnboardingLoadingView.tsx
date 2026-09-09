import React from "react";
import { UiLoadingSpinner } from "@/components/ui/ui-loading-spinner";
import { useTranslation } from "react-i18next";

export function OnboardingLoadingView() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-md mt-10 flex justify-center">
      <UiLoadingSpinner role="status" aria-label={t("auth:onboarding.loadingAria")} className="size-8 text-muted-foreground" />
    </div>
  );
}
