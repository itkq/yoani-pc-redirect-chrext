# yoani-pc-redirect-chrext

Chrome Extension that redirects Yoani sites from their `sp.` hosts to the standard desktop hosts.

Targets:

- `sp.equal-love.jp` -> `equal-love.jp` (`=LOVE`)
- `sp.not-equal-me.jp` -> `not-equal-me.jp` (`≠ME`)
- `sp.nearly-equal-joy.jp` -> `nearly-equal-joy.jp` (`≒JOY`)

The extension preserves the rest of the URL and only replaces the host.

## Stack

- Manifest V3
- WXT
- TypeScript
- Biome
- Vitest
- pnpm

## Setup

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

`pnpm dev` regenerates the DNR rules before starting WXT.

## Build

```sh
pnpm build
pnpm zip
```

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select `.output/chrome-mv3`.

## Configure Redirects

Edit `src/config/redirects.ts`.

```ts
export const redirectRules = [
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
```

This replaces only the host. The remaining URL suffix is preserved by the generated regex rule.

## Release

Pushing a tag like `v0.1.0` triggers GitHub Actions to:

1. verify the source,
2. build the Chrome extension,
3. create a GitHub Release,
4. upload a ready-to-extract ZIP asset.

To use the release asset:

1. Download the ZIP from the GitHub Release.
2. Extract it locally.
3. Open `chrome://extensions`.
4. Enable Developer mode.
5. Click Load unpacked and select the extracted folder.

## Verification Commands

```sh
pnpm generate:rules
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Permissions

- `declarativeNetRequest`: applies the static redirect rules.
- `host_permissions`: limited to the configured source and destination hosts.
