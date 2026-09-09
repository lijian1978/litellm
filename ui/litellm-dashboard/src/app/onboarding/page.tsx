"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";
import { useTranslation } from "react-i18next";

function OnboardingContent() {
  const searchParams = useSearchParams()!;
  const action = searchParams.get("action");
  const variant = action === "reset_password" ? "reset_password" : "signup";
  return <OnboardingForm variant={variant} />;
}

export default function Onboarding() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">{t("loading.ellipsis")}</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
