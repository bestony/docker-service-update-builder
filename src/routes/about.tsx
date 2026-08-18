import { Text } from "@cloudflare/kumo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ALL_FIELDS, SECTIONS } from "#/docker/catalog";
import { PRESETS } from "#/docker/presets";
import { API_DOC_URL, API_VERSION } from "#/docker/request";
import { useI18n } from "#/i18n";

export const Route = createFileRoute("/about")({
	component: About,
	head: () => ({
		meta: [{ title: "About — Docker Service Update Builder" }],
	}),
});

const STACK: Array<[string, string]> = [
	[
		"TanStack Start",
		"The framework. SSR and routing only — this app ships no server functions, so the build is deployable as a static SPA.",
	],
	[
		"TanStack Router",
		"File-based routes plus JSON-first search params. The whole builder state round-trips through ?c= as a base64url permalink.",
	],
	[
		"TanStack Store",
		"Holds the field states. Named actions keep the reducer logic out of components; createAtom derives the spec, the YAML and the review findings.",
	],
	[
		"TanStack Query",
		"Loads the field guide through a dynamic import. The route loader primes the cache, the builder page reads the same entry.",
	],
	[
		"TanStack Intent",
		"Ships the library skills that agents load before touching router or Start code. See AGENTS.md.",
	],
	["TanStack CLI", "Scaffolded the project and installed the add-ons."],
	["Biome", "Formatter and linter. One toolchain, no ESLint or Prettier."],
];

function About() {
	const { t } = useI18n();

	return (
		<main className="page">
			<section className="panel panel--hero about__hero">
				<p className="kicker">{t("about.kicker")}</p>
				<Text variant="heading1" as="h1">
					{t("about.title")}
				</Text>
				<Text variant="secondary">
					{t("about.intro", {
						fields: ALL_FIELDS.length,
						sections: SECTIONS.length,
						version: API_VERSION,
					})}
				</Text>
			</section>

			<section className="panel">
				<Text variant="heading3" as="h2">
					{t("about.howItWorks")}
				</Text>
				<ul className="about__list">
					<li>{t("about.how1")}</li>
					<li>{t("about.how2")}</li>
					<li>{t("about.how3")}</li>
					<li>{t("about.how4")}</li>
					<li>{t("about.how5", { count: PRESETS.length })}</li>
				</ul>
			</section>

			<section className="panel">
				<Text variant="heading3" as="h2">
					{t("about.stack")}
				</Text>
				<dl className="about__stack">
					{STACK.map(([name, description]) => (
						<div className="about__stack-row" key={name}>
							<dt>{name}</dt>
							<dd>{description}</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="panel">
				<Text variant="heading3" as="h2">
					{t("about.scope")}
				</Text>
				<Text variant="secondary" size="sm">
					{t("about.scopeText")}
				</Text>
				<Text size="sm">
					<a href={API_DOC_URL} target="_blank" rel="noreferrer">
						{t("about.apiLink", { version: API_VERSION })}
					</a>{" "}
					· <Link to="/blog">{t("nav.fieldGuide")}</Link> ·{" "}
					<Link to="/">{t("nav.builder")}</Link>
				</Text>
			</section>
		</main>
	);
}
