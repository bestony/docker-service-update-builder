import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";
import type { Locale } from "./locale";
import {
	DEFAULT_LOCALE,
	detectLocale,
	LOCALE_COOKIE,
	normalizeLocale,
} from "./locale";

/**
 * Resolves the locale for the current request.
 *
 * `createIsomorphicFn` is not decoration here: the Start compiler replaces this
 * whole expression with the matching branch per environment, which is what keeps
 * the `@tanstack/react-start/server` import out of the client bundle. A static
 * import plus a `typeof window` guard would compile, then fail the production
 * build on Start's import-protection check.
 *
 * The cookie is the one signal both sides can see, so both branches read it
 * first. On the server it falls back to `Accept-Language`; on the client it
 * falls back to English rather than `navigator.language`, because the server
 * cannot see the navigator and a mismatch there would show up as a hydration
 * error on the first paint.
 */
export const resolveLocaleForRequest = createIsomorphicFn()
	.server((): Locale => {
		const fromCookie = normalizeLocale(getCookie(LOCALE_COOKIE));
		if (fromCookie) return fromCookie;

		return detectLocale(getRequestHeader("accept-language")) ?? DEFAULT_LOCALE;
	})
	.client((): Locale => {
		const fromDocument = normalizeLocale(
			document.cookie.match(/(?:^|;\s*)locale=([^;]*)/)?.[1],
		);
		return fromDocument ?? DEFAULT_LOCALE;
	});
