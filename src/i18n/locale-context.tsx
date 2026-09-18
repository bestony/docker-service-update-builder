import { useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { Locale } from "./locale";
import { htmlLangOf, LOCALE_COOKIE, LOCALE_STORAGE_KEY } from "./locale";
import { translate, translator } from "./messages";
import type { MessageKey, Translate, TranslateVars } from "./translate";

interface LocaleContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writeCookie(locale: Locale) {
	const oneYear = 60 * 60 * 24 * 365;
	// biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is not in Firefox or Safari as of writing, and this is a plain same-origin preference with no encoding needs
	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${oneYear}; samesite=lax`;
}

/**
 * Holds the active locale for the client tree.
 *
 * `initial` is whatever the server resolved from the cookie and
 * `Accept-Language`, so the first client render matches the SSR markup exactly
 * — no hydration mismatch, no language flash. The one unavoidable divergence
 * (a user who switched language on a device where the cookie was later cleared)
 * is reconciled in an effect, after hydration.
 *
 * Only an explicit switch writes storage. Letting an inferred language be
 * persisted as a "preference" would silently pin the site for a reader whose
 * `Accept-Language` merely happened to be Chinese once.
 */
export function LocaleProvider({
	initial,
	children,
}: {
	initial: Locale;
	children: ReactNode;
}) {
	const [locale, setLocaleState] = useState<Locale>(initial);
	const router = useRouter();

	const setLocale = useCallback(
		(next: Locale) => {
			setLocaleState(next);
			writeCookie(next);
			try {
				window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
			} catch {
				// Private mode with storage disabled: the cookie still carries it.
			}
			// Every route's `head` (title, description) is computed from the locale
			// in route context, which only refreshes on a navigation. Without this
			// the tab title would stay in the old language until the reader
			// happened to click a link. `beforeLoad` re-reads the cookie we just
			// wrote, so the context picks up the new locale; the loaders below it
			// then hit the TanStack Query cache, so nothing is refetched.
			router.invalidate();
		},
		[router],
	);

	/**
	 * `<html lang>` is rendered by the shell from route context, which is correct
	 * on the server and on the first hydration but stale after a switch — the
	 * provider is the thing that actually knows. Effect rather than render, so
	 * the DOM is never touched during SSR or against React's own tree.
	 */
	useEffect(() => {
		document.documentElement.lang = htmlLangOf(locale);
	}, [locale]);

	const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

	return (
		<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
	);
}

export function useLocale(): LocaleContextValue {
	const context = useContext(LocaleContext);
	if (!context) {
		throw new Error("useLocale must be used inside <LocaleProvider>");
	}
	return context;
}

/** The translator for the active locale. Stable across renders. */
export function useT(): Translate {
	return translator(useLocale().locale);
}

/** `lang` attribute value for the active locale, for `<html lang>`. */
export function useHtmlLang(): string {
	return htmlLangOf(useLocale().locale);
}

export { translate };
export type { MessageKey, Translate, TranslateVars };
