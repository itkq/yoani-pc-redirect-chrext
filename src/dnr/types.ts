import type { RedirectRuleConfig } from "../config/redirects";

export type DeclarativeNetRequestRule = {
  id: number;
  priority: number;
  action: {
    type: "redirect";
    redirect: {
      regexSubstitution: string;
    };
  };
  condition: {
    regexFilter: string;
    resourceTypes: ["main_frame"];
  };
};

export type ValidRedirectRuleConfig = RedirectRuleConfig & {
  schemes: ("http" | "https")[];
};
