import { defineConfig } from "wxt";
import { redirectRules } from "./src/config/redirects";
import { hostMatchPatterns } from "./src/constants/hosts";

export default defineConfig({
  manifestVersion: 3,
  browser: "chrome",
  outDir: ".output",
  manifest: {
    name: "Yoani PC Redirect",
    short_name: "PC Redirect",
    description:
      "Redirects configured hosts to replacement hosts with declarativeNetRequest.",
    permissions: ["declarativeNetRequest"],
    host_permissions: hostMatchPatterns,
    declarative_net_request: {
      rule_resources: [
        {
          id: "redirect-rules",
          enabled: true,
          path: "rules/redirect-rules.json",
        },
      ],
    },
    action: {
      default_title: `Host redirects active (${redirectRules.length})`,
    },
  },
});
