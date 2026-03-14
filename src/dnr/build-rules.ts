import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  type RedirectRuleConfig,
  type RedirectScheme,
  redirectRules,
} from "../config/redirects";
import type {
  DeclarativeNetRequestRule,
  ValidRedirectRuleConfig,
} from "./types";

const DEFAULT_SCHEMES: RedirectScheme[] = ["http", "https"];
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "public/rules/redirect-rules.json",
);

const HOST_PATTERN =
  /^(?:localhost|(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)$/;

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeRule(
  rule: RedirectRuleConfig,
): ValidRedirectRuleConfig {
  const fromHost = validateHost(rule.fromHost, "fromHost");
  const toHost = validateHost(rule.toHost, "toHost");

  if (fromHost === toHost) {
    throw new Error(`Redirect source and destination must differ: ${fromHost}`);
  }

  const schemes = [...new Set(rule.schemes ?? DEFAULT_SCHEMES)];
  if (schemes.length === 0) {
    throw new Error(`At least one scheme is required for ${fromHost}`);
  }

  for (const scheme of schemes) {
    if (scheme !== "http" && scheme !== "https") {
      throw new Error(`Unsupported scheme "${scheme}" for ${fromHost}`);
    }
  }

  return {
    fromHost,
    toHost,
    schemes,
  };
}

export function validateHost(host: string, fieldName: string): string {
  const normalized = host.trim().toLowerCase();

  if (normalized.length === 0) {
    throw new Error(`${fieldName} must not be empty`);
  }

  if (normalized !== host) {
    throw new Error(
      `${fieldName} must be lowercase and must not include surrounding whitespace: ${host}`,
    );
  }

  if (!HOST_PATTERN.test(normalized)) {
    throw new Error(
      `${fieldName} must be a plain hostname without scheme, port, or path: ${host}`,
    );
  }

  return normalized;
}

export function buildRegexFilter(rule: ValidRedirectRuleConfig): string {
  const schemePattern =
    rule.schemes.length === 1
      ? rule.schemes[0]
      : `(?:${rule.schemes.join("|")})`;
  const escapedHost = escapeRegex(rule.fromHost);
  return `^(${schemePattern})://${escapedHost}(?::\\d+)?(\\/.*)?$`;
}

export function buildRegexSubstitution(rule: ValidRedirectRuleConfig): string {
  return String.raw`\1://${rule.toHost}\2`;
}

export function buildDeclarativeNetRequestRules(
  rules: RedirectRuleConfig[],
): DeclarativeNetRequestRule[] {
  return rules.map((rule, index) => {
    const normalized = normalizeRule(rule);

    return {
      id: index + 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: buildRegexSubstitution(normalized),
        },
      },
      condition: {
        regexFilter: buildRegexFilter(normalized),
        resourceTypes: ["main_frame"],
      },
    } satisfies DeclarativeNetRequestRule;
  });
}

export async function writeRulesFile(
  rules: RedirectRuleConfig[],
  outputPath = OUTPUT_PATH,
): Promise<void> {
  if (rules.length === 0) {
    throw new Error("At least one redirect rule must be configured");
  }

  const generatedRules = buildDeclarativeNetRequestRules(rules);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(generatedRules, null, 2)}\n`,
    "utf8",
  );
}

async function main(): Promise<void> {
  await writeRulesFile(redirectRules);
  process.stdout.write(
    `Generated ${redirectRules.length} redirect rule(s) at ${OUTPUT_PATH}\n`,
  );
}

const executedFile = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;
const currentFile = fileURLToPath(import.meta.url);

if (executedFile === currentFile) {
  main().catch((error: unknown) => {
    const message =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
