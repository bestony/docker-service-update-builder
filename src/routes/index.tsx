import { Banner, Input, Text } from "@cloudflare/kumo";
import { WarningIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import FurtherReading from "#/components/generator/FurtherReading";
import OutputPanel from "#/components/generator/OutputPanel";
import PresetBar from "#/components/generator/PresetBar";
import SectionPanel from "#/components/generator/SectionPanel";
import InlineText from "#/components/InlineText";
import { API_DOC_URL, API_VERSION } from "#/docker/request";
import { getFields, getSections } from "#/i18n/catalog";
import { useLocale, useT } from "#/i18n/locale-context";
import type { GeneratorSearch } from "#/lib/use-generator-url-sync";
import { useGeneratorUrlSync } from "#/lib/use-generator-url-sync";
import type { OutputFormat } from "#/store/generator-store";
import { generatorStore } from "#/store/generator-store";

const FORMATS = new Set<OutputFormat>(["json", "yaml", "curl"]);

export const Route = createFileRoute("/")({
	// A plain function validator keeps the app dependency-free while still giving
	// fully inferred types on Route.useSearch().
	validateSearch: (search: Record<string, unknown>): GeneratorSearch => ({
		c: typeof search.c === "string" && search.c !== "" ? search.c : undefined,
		f:
			typeof search.f === "string" && FORMATS.has(search.f as OutputFormat)
				? (search.f as OutputFormat)
				: undefined,
	}),
	component: GeneratorPage,
});

function GeneratorPage() {
	const t = useT();
	const { locale } = useLocale();
	const search = Route.useSearch();
	useGeneratorUrlSync(search);

	// The catalog is read per locale rather than localizing inside the renderer,
	// so the search filter and the `aria-label`s pick up translated prose for
	// free. Both calls are cached per locale, so the arrays keep their identity.
	const sections = getSections(locale);
	const fields = getFields(locale);
	const filter = useSelector(generatorStore, (state) => state.filter);

	return (
		<main className="page page--wide">
			<section className="panel panel--hero rise-in home-hero">
				<p className="kicker">{t("home.kicker", { version: API_VERSION })}</p>
				<Text variant="heading1" as="h1">
					{t("home.heading")}
				</Text>
				<Text variant="secondary">
					<InlineText text={t("home.intro")} />
				</Text>
				<Banner
					className="home-hero__callout"
					variant="alert"
					icon={<WarningIcon weight="fill" />}
				>
					<p>
						<strong>{t("home.warningLead")}</strong>{" "}
						<InlineText text={t("home.warningBody")} />
					</p>
				</Banner>
				<Text size="sm">
					<a href={API_DOC_URL} target="_blank" rel="noreferrer">
						{t("home.apiRef", { version: API_VERSION })}
					</a>
				</Text>
			</section>

			<PresetBar />

			<div className="home-builder">
				<div className="home-builder__editor">
					<div className="panel">
						{/* Kumo's Field wrapper owns the label, the control and the helper
						    text, so the filter needs no id of its own to stay associated. */}
						<Input
							type="search"
							label={t("home.searchLabel")}
							description={t("home.searchDescription", {
								fields: fields.length,
								sections: sections.length,
							})}
							value={filter}
							placeholder={t("home.searchPlaceholder")}
							onChange={(event) =>
								generatorStore.actions.setFilter(event.target.value)
							}
						/>
					</div>

					{sections.map((section) => (
						<SectionPanel key={section.id} section={section} filter={filter} />
					))}
				</div>

				<div className="home-builder__output">
					<OutputPanel />
					<FurtherReading />
				</div>
			</div>
		</main>
	);
}
