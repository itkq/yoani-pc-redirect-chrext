import { type RedirectRuleConfig, redirectRules } from "../config/redirects";

export function toHostMatchPatterns(rules: RedirectRuleConfig[]): string[] {
  return [
    ...new Set(
      rules
        .flatMap((rule) => [rule.fromHost, rule.toHost])
        .map((host) => `*://${host}/*`),
    ),
  ].sort();
}

export const hostMatchPatterns = toHostMatchPatterns(redirectRules);
