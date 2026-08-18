import { Text } from "@cloudflare/kumo";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { useI18n } from "../i18n";

export default function Footer() {
	const year = new Date().getFullYear();
	const { t } = useI18n();

	return (
		<footer className="footer">
			<div className="footer__inner">
				<div className="footer__row">
					<Text variant="secondary" size="sm">
						{t("footer.copyright", { year })}
					</Text>
					<p className="kicker">{t("footer.builtWith")}</p>
				</div>
				<div className="footer__links">
					<a
						href="https://x.com/tan_stack"
						target="_blank"
						rel="noreferrer"
						className="footer__link"
					>
						<span className="visually-hidden">{t("nav.followX")}</span>
						<XLogoIcon size={24} aria-hidden="true" />
					</a>
					<a
						href="https://github.com/TanStack"
						target="_blank"
						rel="noreferrer"
						className="footer__link"
					>
						<span className="visually-hidden">{t("nav.github")}</span>
						<GithubLogoIcon size={24} aria-hidden="true" />
					</a>
				</div>
			</div>
		</footer>
	);
}
