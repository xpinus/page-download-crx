# Repository Guidelines

## Project Overview
**page-download-crx** is a Chrome extension (Manifest V3) that downloads all web page resources — HTML, CSS, JS, images, and more — via the DevTools panel. It replaces the obsolete Manifest V2 "Dream Downloads" extension.

## Project Structure & Module Organization

```
src/
├── main.ts                 # Vue app entry point
├── App.vue                 # Root component (DevTools panel UI)
├── style.css               # Global styles + Tailwind
├── utils.ts                # Shared utilities (e.g., humanSize)
├── assets/svg/             # SVG icons (auto-registered via vite-plugin-svg-icons)
├── components/
│   ├── ConfigDialog.vue    # Settings dialog (method column visibility, etc.)
│   └── SvgIcon.vue         # Reusable SVG icon wrapper
├── hooks/
│   ├── useConfig.ts        # Extension config (chrome.storage)
│   └── usePanel.ts         # Core panel logic (resource capture, filtering, download)
└── types/index.d.ts        # Shared TypeScript type declarations
public/
├── popup.html              # Extension popup (usage instructions)
└── devtools.html           # DevTools panel host page
```

## Build, Test, and Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check with `vue-tsc`, then produce the `dist/` extension bundle |
| `pnpm preview` | Preview the production build locally |

Load the unpacked `dist/` folder in `chrome://extensions` (Developer mode) to test the extension live.

## Coding Style & Naming Conventions

- **Indentation**: 2 spaces (Prettier default).
- **Language**: TypeScript throughout; Vue SFCs use `<script setup lang="ts">`.
- **Naming**: PascalCase for components (`ConfigDialog.vue`), camelCase for hooks/files (`usePanel.ts`), kebab-case for directories.
- **Path alias**: `@/` maps to `src/` (configured in `vite.config.ts`).
- **Formatting**: Prettier with `prettier-plugin-tailwindcss`; ESLint with `typescript-eslint`, `eslint-plugin-vue`, and `eslint-config-prettier`.
- **Tailwind CSS v4** is used for styling alongside Element Plus components.

## Testing Guidelines

No automated test suite is configured yet. Manual testing is done by:
1. Running `pnpm build` and loading the `dist/` folder as an unpacked extension.
2. Opening DevTools on any page, switching to the **PageDownloader** tab, and verifying resource capture and download.

## Commit & Pull Request Guidelines

- **Commit style**: Follow the existing conventional-changelog pattern — `feat:`, `fix:`, `chore:`, `style:` with Chinese descriptions.
- **PRs**: Link to the relevant issue; include screenshots or a short screen recording of the extension in action when the UI changes.
- **Branch naming**: Use `codex/` prefix for feature/fix branches (e.g., `codex/fix-download-zip`).

## Security & Configuration

- The extension uses only the `storage` permission — no host permissions are requested.
- Resource filtering (by host/method) happens client-side; no data is sent externally.
- Version is managed in `package.json` and mirrored in `dist/manifest.json`.
