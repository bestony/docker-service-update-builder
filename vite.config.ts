import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	// cloudflare() must precede tanstackStart() so it can claim the "ssr" Vite
	// environment and run the server build inside workerd.
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		devtools(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
