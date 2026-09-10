import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EndpointUsage from "./EndpointUsage";

vi.mock("./components/EndpointUsageBarChart", () => ({
  default: () => <div data-testid="endpoint-usage-bar-chart" />,
}));

vi.mock("./components/EndpointUsageLineChart", () => ({
  default: () => <div data-testid="endpoint-usage-line-chart" />,
}));

vi.mock("./components/EndpointUsageTable", () => ({
  default: () => <div data-testid="endpoint-usage-table" />,
}));

describe("EndpointUsage", () => {
  it("should render", () => {
    render(<EndpointUsage />);

    expect(screen.getByTestId("endpoint-usage-table")).toBeInTheDocument();
    expect(screen.getByTestId("endpoint-usage-bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("endpoint-usage-line-chart")).toBeInTheDocument();
  });
});
