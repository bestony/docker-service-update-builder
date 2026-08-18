import { Button } from "@cloudflare/kumo";
import { useI18n } from "../i18n";

export default function LanguageToggle() {
	const { locale, setLocale, t } = useI18n();

	return (
		<fieldset className="language-toggle" aria-label={t("language.switch")}>
			<legend className="visually-hidden">{t("language.switch")}</legend>
			<Button
				size="xs"
				variant={locale === "en" ? "primary" : "secondary"}
				aria-pressed={locale === "en"}
				onClick={() => setLocale("en")}
				title={t("language.english")}
			>
				{t("language.english")}
			</Button>
			<Button
				size="xs"
				variant={locale === "zh-CN" ? "primary" : "secondary"}
				aria-pressed={locale === "zh-CN"}
				onClick={() => setLocale("zh-CN")}
				title={t("language.chinese")}
			>
				{t("language.chinese")}
			</Button>
		</fieldset>
	);
}
