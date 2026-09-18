import { Text } from "@cloudflare/kumo";
import { createFileRoute, Link } from "@tanstack/react-router";
import InlineText from "#/components/InlineText";
import { PRESETS } from "#/docker/presets";
import { API_DOC_URL, API_VERSION } from "#/docker/request";
import { getFields, getSections } from "#/i18n/catalog";
import { useLocale, useT } from "#/i18n/locale-context";
import { translate } from "#/i18n/messages";
import type { MessageKey } from "#/i18n/translate";

export const Route = createFileRoute("/about")({
	component: About,
	head: ({ match }) => ({
		meta: [{ title: translate(match.context.locale, "about.title") }],
	}),
});

/**
 * Stack entries: the technology's name is a proper noun and stays as-is in both
 * languages; only the description is a message. Keying by name means the list
 * order is the only thing shared between the two.
 */
const STACK: Array<{ name: string; description: MessageKey }> = [
	{ name: "TanStack Start", description: "about.stackEntries.start" },
	{ name: "TanStack Router", description: "about.stackEntries.router" },
	{ name: "TanStack Store", description: "about.stackEntries.store" },
	{ name: "TanStack Query", description: "about.stackEntries.query" },
	{ name: "TanStack Intent", description: "about.stackEntries.intent" },
	{ name: "TanStack CLI", description: "about.stackEntries.cli" },
	{ name: "Biome", description: "about.stackEntries.biome" },
	{ name: "i18n", description: "about.stackEntries.i18n" },
];

function About() {
	const t = useT();
	const { locale } = useLocale();
	const fieldCount = getFields(locale).length;
	const sectionCount = getSections(locale).length;

	return (
		<main className="page">
			<section className="panel panel--hero about__hero">
				<p className="kicker">{t("about.kicker")}</p>
				<Text variant="heading1" as="h1">
					{t("about.heading")}
				</Text>
				<Text variant="secondary">
					<InlineText
						text={t("about.intro", {
							fields: fieldCount,
							sections: sectionCount,
							version: API_VERSION,
						})}
					/>
				</Text>
			</section>

			<section className="panel">
				<Text variant="heading3" as="h2">
					{t("about.howItWorks")}
				</Text>
				<ul className="about__list">
					<li>
						<InlineText text={t("about.howItWorks1")} />
					</li>
					<li>{t("about.howItWorks2")}</li>
					<li>{t("about.howItWorks3")}</li>
					<li>{t("about.howItWorks4")}</li>
					<li>{t("about.howItWorks5", { count: PRESETS.length })}</li>
				</ul>
			</section>

			<section className="panel">
				<Text variant="heading3" as="h2">
					{t("about.stack")}
				</Text>
				<dl className="about__stack">
					{STACK.map((entry) => (
						<div className="about__stack-row" key={entry.name}>
							<dt>{entry.name}</dt>
							<dd>{t(entry.description)}</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="panel">
				<Text variant="heading3" as="h2">
					{t("about.scope")}
				</Text>
				<Text variant="secondary" size="sm">
					{t("about.scopeBody")}
				</Text>
				<Text size="sm">
					<a href={API_DOC_URL} target="_blank" rel="noreferrer">
						{t("about.apiRef", { version: API_VERSION })}
					</a>{" "}
					· <Link to="/blog">{t("about.guide")}</Link> ·{" "}
					<Link to="/">{t("about.builder")}</Link>
				</Text>
			</section>
		</main>
	);
}
