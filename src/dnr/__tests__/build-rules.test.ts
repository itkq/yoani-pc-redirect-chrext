import { describe, expect, it } from "vitest";
import {
  buildDeclarativeNetRequestRules,
  buildRegexFilter,
  buildRegexSubstitution,
  escapeRegex,
  normalizeRule,
  validateHost,
} from "../build-rules";

describe("build-rules", () => {
  it("builds a redirect rule that preserves the matched suffix", () => {
    expect(
      buildDeclarativeNetRequestRules([
        {
          fromHost: "old.example.com",
          toHost: "new.example.com",
        },
      ]),
    ).toEqual([
      {
        id: 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            regexSubstitution: String.raw`\1://new.example.com\2`,
          },
        },
        condition: {
          regexFilter: String.raw`^((?:http|https))://old\.example\.com(?::\d+)?(\/.*)?$`,
          resourceTypes: ["main_frame"],
        },
      },
    ]);
  });

  it("assigns stable incremental ids", () => {
    const rules = buildDeclarativeNetRequestRules([
      { fromHost: "one.example.com", toHost: "one-new.example.com" },
      { fromHost: "two.example.com", toHost: "two-new.example.com" },
    ]);

    expect(rules.map((rule) => rule.id)).toEqual([1, 2]);
  });

  it("escapes hostnames for regex generation", () => {
    expect(escapeRegex("old.example.com")).toBe("old\\.example\\.com");
  });

  it("supports a single configured scheme", () => {
    const rule = normalizeRule({
      fromHost: "old.example.com",
      toHost: "new.example.com",
      schemes: ["https"],
    });

    expect(buildRegexFilter(rule)).toBe(
      String.raw`^(https)://old\.example\.com(?::\d+)?(\/.*)?$`,
    );
    expect(buildRegexSubstitution(rule)).toBe(
      String.raw`\1://new.example.com\2`,
    );
  });

  it("rejects invalid hosts", () => {
    expect(() => validateHost("https://old.example.com", "fromHost")).toThrow(
      /plain hostname/,
    );
    expect(() => validateHost("old.example.com/path", "fromHost")).toThrow(
      /plain hostname/,
    );
    expect(() => validateHost("OLD.EXAMPLE.COM", "fromHost")).toThrow(
      /lowercase/,
    );
  });

  it("rejects self-redirects", () => {
    expect(() =>
      normalizeRule({
        fromHost: "old.example.com",
        toHost: "old.example.com",
      }),
    ).toThrow(/must differ/);
  });
});
