import { LinkButton } from "@cloudflare/kumo";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";

/**
 * TanStack Router concatenates `activeProps.className` onto the link's own
 * `className`, so the active state only has to carry the modifier. Hoisted so
 * every nav link shares one object instead of allocating a fresh one per render.
 */
const NAV_ACTIVE_PROPS = { className: "site-nav__link--active" };

export default function Header() {
	return (
		<header className="site-header">
			<nav className="site-header__inner">
				<h2 className="site-header__brand">
					<Link to="/" className="site-header__brand-link">
						<span className="site-header__brand-dot" aria-hidden="true" />
						Service Update Builder
					</Link>
				</h2>

				<div className="site-nav">
					<Link
						to="/"
						className="site-nav__link"
						activeProps={NAV_ACTIVE_PROPS}
					>
						Builder
					</Link>
					<Link
						to="/blog"
						className="site-nav__link"
						activeProps={NAV_ACTIVE_PROPS}
					>
						Field guide
					</Link>
					<Link
						to="/about"
						className="site-nav__link"
						activeProps={NAV_ACTIVE_PROPS}
					>
						About
					</Link>
					<a
						href="https://docs.docker.com/reference/api/engine/version/v1.43/#tag/Service/operation/ServiceUpdate"
						className="site-nav__link"
						target="_blank"
						rel="noreferrer"
					>
						API docs
					</a>
					{/* Stays a native <details> so the menu still opens before hydration. */}
					<details className="site-nav__menu">
						<summary className="site-nav__link site-nav__menu-summary">
							Demos
						</summary>
						<div className="site-nav__menu-panel">
							<a href="/demo/tanstack-query" className="site-nav__menu-item">
								TanStack Query
							</a>
							<a href="/demo/store" className="site-nav__menu-item">
								Store
							</a>
						</div>
					</details>
				</div>

				<div className="site-header__actions">
					<LinkButton
						href="https://x.com/tan_stack"
						external
						shape="square"
						size="sm"
						variant="ghost"
						className="site-header__social"
						icon={<XLogoIcon size={16} aria-hidden="true" />}
						aria-label="Follow TanStack on X"
					/>
					<LinkButton
						href="https://github.com/TanStack"
						external
						shape="square"
						size="sm"
						variant="ghost"
						className="site-header__social"
						icon={<GithubLogoIcon size={16} aria-hidden="true" />}
						aria-label="Go to TanStack GitHub"
					/>

					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
