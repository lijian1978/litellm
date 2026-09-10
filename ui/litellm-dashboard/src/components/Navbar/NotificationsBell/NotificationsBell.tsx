"use client";

import {
  HIDE_AUTO_ROUTER_ANNOUNCEMENT_KEY,
  useHideAutoRouterAnnouncement,
} from "@/app/(dashboard)/hooks/useHideAutoRouterAnnouncement";
import { emitLocalStorageChange, setLocalStorageItem } from "@/utils/localStorageUtils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/cva.config";
import { Bell } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const AUTO_ROUTER_DOCS_URL = "https://docs.litellm.ai/docs/proxy/auto_routing";

export const NotificationsBell: React.FC = () => {
  const { t } = useTranslation();
  const hidden = useHideAutoRouterAnnouncement();
  const hasUnread = !hidden;
  const [open, setOpen] = useState(false);

  const markDismissed = () => {
    setLocalStorageItem(HIDE_AUTO_ROUTER_ANNOUNCEMENT_KEY, "true");
    emitLocalStorageChange(HIDE_AUTO_ROUTER_ANNOUNCEMENT_KEY);
    setOpen(false);
  };

  const content = (
    <div className="max-w-[280px]">
      <PopoverTitle className="mt-0! mb-2!">{t("navigation:notifications.autoRouterTitle")}</PopoverTitle>
      <PopoverDescription className="mb-3! text-sm leading-snug">
        {t("navigation:notifications.autoRouterBody")}
      </PopoverDescription>
      <div className="flex flex-wrap items-center gap-2">
        <a
          className={cn(buttonVariants({ size: "sm" }))}
          href={AUTO_ROUTER_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("navigation:notifications.readDocs")}
        </a>
        {hasUnread ? (
          <Button variant="link" size="sm" className="px-1!" onClick={markDismissed}>
            {t("navigation:notifications.markAsRead")}
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex! h-9! w-9! items-center justify-center rounded-md! text-muted-foreground transition-colors hover:bg-accent! hover:text-foreground!"
        aria-label={t("navigation:notifications.triggerAria")}
      >
        <span className="relative inline-flex">
          <Bell className="size-4" aria-hidden />
          {hasUnread ? <Badge className="absolute -top-0.5 -right-1 size-1.5 p-0" aria-hidden /> : null}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end">{content}</PopoverContent>
    </Popover>
  );
};
