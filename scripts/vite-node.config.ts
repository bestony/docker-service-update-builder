import { defineConfig } from "vite";

/**
 * Minimal config for `scripts/check-i18n.ts`.
 *
 * It only needs the `#/` path alias resolved — running under the app's real
 * config would load the Cloudflare and Start plugins, neither of which this
 * script touches, and leave their watchers holding the process open.
 */
export default defineConfig({
	resolve: { tsconfigPaths: true },
});
