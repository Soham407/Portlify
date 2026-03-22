import { describe, expect, it } from "vitest";
import {
  canSectionBeMarkedNotApplicable,
  getRenderableSectionIds,
  normalizeNotApplicableSections,
} from "@/lib/portfolioSections";

describe("portfolio section visibility rules", () => {
  it("does not allow compulsory sections like bio to be marked not applicable", () => {
    expect(canSectionBeMarkedNotApplicable("bio")).toBe(false);
    expect(normalizeNotApplicableSections(["bio", "experience", "experience"])).toEqual([
      "experience",
    ]);
  });

  it("keeps compulsory sections renderable even if stale data includes them as not applicable", () => {
    expect(
      getRenderableSectionIds(
        ["bio", "experience", "contact"],
        [],
        { bio: true, experience: true, contact: true },
        ["bio", "experience"]
      )
    ).toEqual(["bio", "contact"]);
  });
});
