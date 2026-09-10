"use client";

import { useTranslation } from "react-i18next";

import { CellTooltip } from "./cell_tooltip";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export type DatePrecision = "datetime" | "date";

interface DateCellProps {
  value: string | null | undefined;
  precision?: DatePrecision;
  fallback?: string;
}

const pad = (n: number): string => String(n).padStart(2, "0");

const ZH_DATE_TIME_OPTIONS = {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
} as const;

const ZH_DATE = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric" });
const ZH_DATE_TIME = new Intl.DateTimeFormat("zh-CN", ZH_DATE_TIME_OPTIONS);

export const formatCellDate = (date: Date, precision: DatePrecision, locale = "en"): string => {
  if (locale.startsWith("zh")) {
    return precision === "date" ? ZH_DATE.format(date) : ZH_DATE_TIME.format(date);
  }
  return precision === "date"
    ? `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    : `${MONTHS[date.getMonth()]} ${date.getDate()}, ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatFullTimestamp = (date: Date, locale = "en"): string => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (locale.startsWith("zh")) {
    return `${ZH_DATE.format(date)}, ${ZH_DATE_TIME.format(date)} (${timeZone})`;
  }
  const day = `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${day}, ${time} (${timeZone})`;
};

export function DateCell({ value, precision = "datetime", fallback = "-" }: DateCellProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language || "en";
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return <span className="text-muted-foreground">{fallback}</span>;
  }

  return (
    <CellTooltip
      content={formatFullTimestamp(date, locale)}
      trigger={<span className="whitespace-nowrap">{formatCellDate(date, precision, locale)}</span>}
    />
  );
}
