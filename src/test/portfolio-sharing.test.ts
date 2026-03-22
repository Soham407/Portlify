import { describe, expect, it } from "vitest";
import { getPortfolioPublicUrl, getPortfolioShareUrl } from "@/lib/portfolioSharing";

const origin = "https://portlify.app";
const username = "alex";

describe("portfolio sharing URLs", () => {
  it("uses the clean username route for the default portfolio", () => {
    expect(
      getPortfolioPublicUrl({
        origin,
        username,
        portfolio: {
          is_default: true,
          share_token: "token-123",
        } as never,
      }),
    ).toBe(`${origin}/p/${username}`);
  });

  it("uses the tokenized public route for a specific non-default portfolio", () => {
    expect(
      getPortfolioPublicUrl({
        origin,
        username,
        portfolio: {
          is_default: false,
          share_token: "token-123",
        } as never,
      }),
    ).toBe(`${origin}/p/${username}/token-123`);
  });

  it("keeps unlisted sharing on the dedicated share route", () => {
    expect(
      getPortfolioShareUrl({
        origin,
        username,
        portfolio: {
          is_default: false,
          share_token: "token-123",
          visibility: "unlisted",
        } as never,
      }),
    ).toBe(`${origin}/share/token-123`);
  });
});
