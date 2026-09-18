import { Text } from "@cloudflare/kumo";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { useT } from "#/i18n/locale-context";
import { AUTHOR_X_URL, PROJECT_GITHUB_URL } from "#/site-links";

export default function Footer() {
	const t = useT();
	const year = new Date().getFullYear();

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
						href={AUTHOR_X_URL}
						target="_blank"
						rel="noreferrer"
						className="footer__link"
					>
						<span className="visually-hidden">{t("header.followX")}</span>
						<XLogoIcon size={24} aria-hidden="true" />
					</a>
					<a
						href={PROJECT_GITHUB_URL}
						target="_blank"
						rel="noreferrer"
						className="footer__link"
					>
						<span className="visually-hidden">{t("header.github")}</span>
						<GithubLogoIcon size={24} aria-hidden="true" />
					</a>
				</div>
			</div>
		</footer>
	);
}
