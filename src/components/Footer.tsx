import { Text } from "@cloudflare/kumo";
import { GithubLogoIcon, XLogoIcon } from "@phosphor-icons/react";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="footer">
			<div className="footer__inner">
				<div className="footer__row">
					<Text variant="secondary" size="sm">
						&copy; {year} Your name here. All rights reserved.
					</Text>
					<p className="kicker">Built with TanStack Start</p>
				</div>
				<div className="footer__links">
					<a
						href="https://x.com/tan_stack"
						target="_blank"
						rel="noreferrer"
						className="footer__link"
					>
						<span className="visually-hidden">Follow TanStack on X</span>
						<XLogoIcon size={24} aria-hidden="true" />
					</a>
					<a
						href="https://github.com/TanStack"
						target="_blank"
						rel="noreferrer"
						className="footer__link"
					>
						<span className="visually-hidden">Go to TanStack GitHub</span>
						<GithubLogoIcon size={24} aria-hidden="true" />
					</a>
				</div>
			</div>
		</footer>
	);
}
