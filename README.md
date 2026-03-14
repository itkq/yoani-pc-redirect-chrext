# yoani-pc-redirect-chrext

Chrome Extension that redirects configured hosts to replacement hosts using `declarativeNetRequest` static rules.

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
    fromHost: "old.example.com",
    toHost: "new.example.com",
    schemes: ["http", "https"]
  }
];
```

This replaces only the host. The remaining URL suffix is preserved by the generated regex rule.

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
