export type RedirectScheme = "http" | "https";

export type RedirectRuleConfig = {
  fromHost: string;
  toHost: string;
  schemes?: RedirectScheme[];
};

export const redirectRules: RedirectRuleConfig[] = [
  {
    fromHost: "sp.equal-love.jp",
    toHost: "equal-love.jp",
    schemes: ["http", "https"],
  },
  {
    fromHost: "sp.not-equal-me.jp",
    toHost: "not-equal-me.jp",
    schemes: ["http", "https"],
  },
  {
    fromHost: "sp.nearly-equal-joy.jp",
    toHost: "nearly-equal-joy.jp",
    schemes: ["http", "https"],
  },
];
