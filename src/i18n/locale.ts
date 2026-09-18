/**
 * Locale identity, storage keys and detection.
 *
 * Deliberately dependency-free: this module is imported by the catalog's
 * parallel translation tables and by the `scripts/check-i18n.ts` self-check,
 * both of which run outside a browser.
 *
 * There is no language prefix in the URL. The builder's `?c=` permalink and
 * every `/blog/$slug` link stay language-independent, so a link pasted into a
 * chat opens in whatever language the reader has chosen.
 */

export const LOCALES = ["en", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie read on the server during SSR, and written when the user switches. */
export const LOCALE_COOKIE = "locale";

/** Mirrors the cookie so a blocked-cookie browser still remembers the choice. */
export const LOCALE_STORAGE_KEY = "locale";

const HTML_LANG: Record<Locale, string> = {
	en: "en",
	zh: "zh-CN",
};

export function htmlLangOf(locale: Locale): string {
	return HTML_LANG[locale];
}

/**
 * Maps a BCP 47 tag onto a locale we actually ship. Only the primary subtag
 * matters — `zh-CN`, `zh-Hans` and `zh-TW` all land on `zh`, `en-GB` on `en`.
 */
export function normalizeLocale(raw: string | undefined): Locale | undefined {
	if (!raw) return undefined;
	const base = raw.trim().toLowerCase().split(/[-_]/)[0];
	return LOCALES.find((locale) => locale === base);
}

/**
 * Picks the most preferred language we can actually speak out of an
 * `Accept-Language` header. Returns `undefined` when nothing matches, so the
 * caller decides the fallback instead of this function guessing.
 */
export function detectLocale(
	acceptLanguage: string | undefined,
): Locale | undefined {
	if (!acceptLanguage) return undefined;

	const ranked = acceptLanguage
		.split(",")
		.map((entry) => {
			const [tag, ...parameters] = entry.split(";");
			const quality = parameters
				.map((parameter) => parameter.trim())
				.find((parameter) => parameter.startsWith("q="));
			const parsed = quality ? Number(quality.slice(2)) : 1;
			return {
				tag: tag.trim(),
				quality: Number.isFinite(parsed) ? parsed : 0,
			};
		})
		.filter((entry) => entry.tag !== "" && entry.quality > 0)
		// Stable for equal weights, which is what the header asks for.
		.sort((left, right) => right.quality - left.quality);

	for (const entry of ranked) {
		const locale = normalizeLocale(entry.tag);
		if (locale) return locale;
	}

	return undefined;
}
