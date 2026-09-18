import type { Locale } from "./locale";
import { en } from "./messages-en";
import { zh } from "./messages-zh";
import type { MessageKey, Translate, TranslateVars } from "./translate";
import { translatorFor } from "./translate";

/**
 * One bound translator per locale, built once. `t` is then a stable function
 * reference, which matters because it ends up in `useMemo`/effect dependency
 * lists in the components.
 */
const TRANSLATORS: Record<Locale, Translate> = {
	en: translatorFor(en),
	zh: translatorFor(zh),
};

export function translator(locale: Locale): Translate {
	return TRANSLATORS[locale];
}

export function translate(
	locale: Locale,
	key: MessageKey,
	vars?: TranslateVars,
): string {
	return TRANSLATORS[locale](key, vars);
}

export type { MessageKey, Translate, TranslateVars };
