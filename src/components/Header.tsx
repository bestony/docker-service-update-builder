import { LinkButton } from "@cloudflare/kumo";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { AUTHOR_X_URL, PROJECT_GITHUB_URL } from "#/site-links";
import { useI18n } from "../i18n";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";

/**
 * TanStack Router concatenates `activeProps.className` onto the link's own
 * `className`, so the active state only has to carry the modifier. Hoisted so
 * every nav link shares one object instead of allocating a fresh one per render.
 */
const NAV_ACTIVE_PROPS = { className: "site-nav__link--active" };

export default function Header() {
	const { t } = useI18n();

	return (
		<header className="site-header">
			<nav className="site-header__inner">
				<h2 className="site-header__brand">
					<Link to="/" className="site-header__brand-link">
						<span className="site-header__brand-dot" aria-hidden="true" />
						{t("nav.brand")}
					</Link>
				</h2>

				<div className="site-nav">
					<Link
						to="/"
						className="site-nav__link"
						activeProps={NAV_ACTIVE_PROPS}
					>
						{t("nav.builder")}
					</Link>
					<Link
						to="/blog"
						className="site-nav__link"
						activeProps={NAV_ACTIVE_PROPS}
					>
						{t("nav.fieldGuide")}
					</Link>
					<Link
						to="/about"
						className="site-nav__link"
						activeProps={NAV_ACTIVE_PROPS}
					>
						{t("nav.about")}
					</Link>
					<a
						href="https://docs.docker.com/reference/api/engine/version/v1.43/#tag/Service/operation/ServiceUpdate"
						className="site-nav__link"
						target="_blank"
						rel="noreferrer"
					>
						{t("nav.apiDocs")}
					</a>
					{/* Stays a native <details> so the menu still opens before hydration. */}
					<details className="site-nav__menu">
						<summary className="site-nav__link site-nav__menu-summary">
							{t("nav.demos")}
						</summary>
						<div className="site-nav__menu-panel">
							<a href="/demo/tanstack-query" className="site-nav__menu-item">
								{t("nav.queryDemo")}
							</a>
							<a href="/demo/store" className="site-nav__menu-item">
								{t("nav.storeDemo")}
							</a>
						</div>
					</details>
				</div>

				<div className="site-header__actions">
					<LinkButton
						href={AUTHOR_X_URL}
						external
						shape="square"
						size="sm"
						variant="ghost"
						className="site-header__social"
						icon={<XLogoIcon size={16} aria-hidden="true" />}
						aria-label={t("nav.followX")}
					/>
					<LinkButton
						href={PROJECT_GITHUB_URL}
						external
						shape="square"
						size="sm"
						variant="ghost"
						className="site-header__social"
						icon={<GithubLogoIcon size={16} aria-hidden="true" />}
						aria-label={t("nav.github")}
					/>

					<LanguageToggle />
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
