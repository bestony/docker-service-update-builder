import { Button } from "@cloudflare/kumo";
import { TranslateIcon } from "@phosphor-icons/react";
import { useLocale, useT } from "#/i18n/locale-context";

/**
 * Two languages, so a toggle beats a menu: one click, no popup, and the label
 * names the language you are about to get rather than the one you are in (which
 * the page itself already makes obvious).
 */
export default function LocaleToggle() {
	const { locale, setLocale } = useLocale();
	const t = useT();

	const next = locale === "zh" ? "en" : "zh";
	const label = t("locale.switch");

	return (
		<Button
			variant="secondary"
			size="sm"
			icon={TranslateIcon}
			onClick={() => setLocale(next)}
			aria-label={label}
			title={label}
		>
			<span className="locale-toggle__label">{t("locale.label")}</span>
		</Button>
	);
}
