import type { Tables } from "@/integrations/supabase/types";

type PortfolioRecord = Tables<"portfolios"> | null | undefined;

interface ShareUrlOptions {
  origin: string;
  username: string | null | undefined;
  portfolio: PortfolioRecord;
}

export const getPortfolioPublicUrl = ({
  origin,
  username,
  portfolio,
}: ShareUrlOptions) => {
  if (!portfolio || !username) return "";

  if (portfolio.is_default || !portfolio.share_token) {
    return `${origin}/p/${username}`;
  }

  return `${origin}/p/${username}/${portfolio.share_token}`;
};

export const getPortfolioShareUrl = (options: ShareUrlOptions) => {
  const { origin, portfolio } = options;

  if (!portfolio) return "";
  if (portfolio.visibility === "unlisted") {
    return portfolio.share_token ? `${origin}/share/${portfolio.share_token}` : "";
  }

  return getPortfolioPublicUrl(options);
};

export const canSharePortfolio = ({
  username,
  portfolio,
}: Pick<ShareUrlOptions, "username" | "portfolio">) => {
  if (!portfolio) return false;
  if (portfolio.visibility === "public") return Boolean(username);
  if (portfolio.visibility === "unlisted") return Boolean(portfolio.share_token);
  return false;
};
