import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Header from "@/components/landing/Header";
import { AppTestProviders } from "./test-utils";

describe("brand smoke", () => {
  it("renders the Portlify shell wordmark", () => {
    render(
      <AppTestProviders>
        <Header authState="anonymous" />
      </AppTestProviders>,
    );

    expect(screen.getByText("Portlify")).toBeInTheDocument();
  });
});
