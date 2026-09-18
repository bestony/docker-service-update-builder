import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { htmlLangOf } from "../i18n/locale";
import { LocaleProvider } from "../i18n/locale-context";
import { resolveLocaleForRequest } from "../i18n/locale-request";
import { translate } from "../i18n/messages";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

/**
 * Kumo resolves its palette through CSS `light-dark()`, which reads the
 * `color-scheme` property, and layers manual overrides behind `[data-mode]`.
 * Setting both before first paint is what keeps the page from flashing the
 * light theme on a dark-mode load.
 *
 * The locale gets the same treatment for the same reason. `<html lang>` is part
 * of the server's HTML and the copy is rendered by React, so the only way to
 * avoid a language flash is to resolve it on the server. The server does that in
 * `beforeLoad` below; there is deliberately no client-side fallback to
 * `navigator.language`, because the server cannot see it and the two would
 * disagree on the first paint.
 */
const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.setAttribute('data-mode',resolved);root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	/**
	 * `beforeLoad` rather than `loader`: the value has to be readable from every
	 * child loader (the field guide primes its query cache with it) and from
	 * `head`, and route context is the one channel that reaches both.
	 */
	beforeLoad: () => ({ locale: resolveLocaleForRequest() }),
	head: ({ match }) => {
		const locale = match.context.locale;
		return {
			meta: [
				{ charSet: "utf-8" },
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{ title: translate(locale, "home.title") },
				{
					name: "description",
					content: translate(locale, "home.description"),
				},
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
			],
		};
	},
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { locale } = Route.useRouteContext();

	return (
		<html lang={htmlLangOf(locale)} suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, build-time constant that must run before paint to avoid a theme flash */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body>
				<LocaleProvider initial={locale}>
					<Header />
					{children}
					<Footer />
				</LocaleProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
