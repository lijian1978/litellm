import { render, screen } from "@testing-library/react";
import { getI18n } from "@/i18n";
import { describe, expect, it } from "vitest";

import { DateCell, formatCellDate, formatFullTimestamp } from "./date_cell";

const localIso = new Date(2026, 6, 7, 9, 50, 13).toISOString();

describe("formatCellDate", () => {
  it("formats datetime precision as 'MMM D, HH:mm:ss' without a year", () => {
    expect(formatCellDate(new Date(2026, 6, 7, 9, 50, 13), "datetime")).toBe("Jul 7, 09:50:13");
  });

  it("zero-pads hours, minutes and seconds", () => {
    expect(formatCellDate(new Date(2026, 0, 2, 1, 2, 3), "datetime")).toBe("Jan 2, 01:02:03");
  });

  it("formats date precision as 'MMM D, YYYY' with no time", () => {
    expect(formatCellDate(new Date(2026, 11, 31, 23, 59, 59), "date")).toBe("Dec 31, 2026");
  });
});

describe("formatCellDate with a zh locale", () => {
  it("formats datetime precision in the zh-CN calendar style", () => {
    expect(formatCellDate(new Date(2026, 6, 7, 9, 50, 13), "datetime", "zh-CN")).toBe("7月7日 09:50:13");
  });

  it("formats date precision with the zh-CN year-month-day order", () => {
    expect(formatCellDate(new Date(2026, 11, 31, 23, 59, 59), "date", "zh-CN")).toBe("2026年12月31日");
  });

  it("treats any zh-prefixed locale as zh-CN", () => {
    expect(formatCellDate(new Date(2026, 6, 7), "date", "zh")).toBe("2026年7月7日");
  });
});

describe("formatFullTimestamp", () => {
  it("includes year, 24h time and the IANA timezone", () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(formatFullTimestamp(new Date(2026, 6, 7, 9, 50, 13))).toBe(`Jul 7, 2026, 09:50:13 (${timeZone})`);
  });

  it("uses the zh-CN calendar style for zh locales", () => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(formatFullTimestamp(new Date(2026, 6, 7, 9, 50, 13), "zh-CN")).toBe(
      `2026年7月7日, 7月7日 09:50:13 (${timeZone})`,
    );
  });
});

describe("DateCell", () => {
  it("renders the datetime format by default", () => {
    render(<DateCell value={localIso} />);
    expect(screen.getByText("Jul 7, 09:50:13")).toBeInTheDocument();
  });

  it("renders date-only when precision is 'date'", () => {
    render(<DateCell value={localIso} precision="date" />);
    expect(screen.getByText("Jul 7, 2026")).toBeInTheDocument();
  });

  it("renders '-' for null and undefined", () => {
    const { rerender } = render(<DateCell value={null} />);
    expect(screen.getByText("-")).toBeInTheDocument();
    rerender(<DateCell value={undefined} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders the custom fallback for empty values", () => {
    render(<DateCell value="" fallback="Never" />);
    expect(screen.getByText("Never")).toBeInTheDocument();
  });

  it("renders the zh-CN format when the active language is zh-CN", async () => {
    const i18n = await getI18n();
    await i18n.changeLanguage("zh-CN");
    try {
      render(<DateCell value={localIso} />);
      expect(screen.getByText("7月7日 09:50:13")).toBeInTheDocument();
    } finally {
      await i18n.changeLanguage("en");
    }
  });

  it("renders the fallback instead of 'Invalid Date' for unparseable input", () => {
    render(<DateCell value="not-a-date" fallback="Unknown" />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.queryByText(/Invalid/)).not.toBeInTheDocument();
  });
});
