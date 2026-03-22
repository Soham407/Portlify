import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartStyle } from "@/components/ui/chart";

describe("chart style theme selectors", () => {
  it("emits light and wood selectors", () => {
    const { container } = render(
      <ChartStyle
        id="chart-wood"
        config={{
          series: {
            theme: {
              light: "hsl(20 15% 45%)",
              wood: "hsl(28 43% 38%)",
            },
          },
        }}
      />,
    );

    const style = container.querySelector("style");

    expect(style).not.toBeNull();
    expect(style?.textContent).toContain("[data-chart=chart-wood]");
    expect(style?.textContent).toContain(".wood [data-chart=chart-wood]");
    expect(style?.textContent).toContain("--color-series: hsl(20 15% 45%)");
    expect(style?.textContent).toContain("--color-series: hsl(28 43% 38%)");
  });
});
