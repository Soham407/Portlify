import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingFeedback from "@/components/landing/LandingFeedback";

describe("landing feedback", () => {
  it("renders the five-question form", () => {
    render(<LandingFeedback />);

    expect(screen.getByText(/help shape the/i)).toBeInTheDocument();
    expect(screen.getByText("Which feature did you like most?")).toBeInTheDocument();
    expect(screen.getByText("Which feature did you like least?")).toBeInTheDocument();
    expect(screen.getByText("Which feature would you like most?")).toBeInTheDocument();
    expect(screen.getByText("What almost stopped you from signing up today?")).toBeInTheDocument();
    expect(screen.getByText("What kind of user are you?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send feedback/i })).toBeInTheDocument();
  });
});
