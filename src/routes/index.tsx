import { Banner, Input, Text } from "@cloudflare/kumo";
import { WarningIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import FurtherReading from "#/components/generator/FurtherReading";
import OutputPanel from "#/components/generator/OutputPanel";
import PresetBar from "#/components/generator/PresetBar";
import SectionPanel from "#/components/generator/SectionPanel";
import { ALL_FIELDS, SECTIONS } from "#/docker/catalog";
import { API_DOC_URL, API_VERSION } from "#/docker/request";
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
	head: () => ({
		meta: [
			{ title: "Docker Service Update Builder" },
			{
				name: "description",
				content:
					"Build a Docker Engine API ServiceUpdate object visually and export it as JSON, YAML or curl.",
			},
		],
	}),
});

function GeneratorPage() {
	const search = Route.useSearch();
	useGeneratorUrlSync(search);

	const filter = useSelector(generatorStore, (state) => state.filter);

	return (
		<main className="page page--wide">
			<section className="panel panel--hero rise-in home-hero">
				<p className="kicker">
					Docker Engine API {API_VERSION} · ServiceUpdate
				</p>
				<Text variant="heading1" as="h1">
					Build a service update object you can actually explain.
				</Text>
				<Text variant="secondary">
					Tick the keys you want to change, in units humans use. Every field
					carries the reasoning behind it, the CLI flag it maps to, and the
					Compose key it corresponds to. The result exports as JSON, YAML or a
					runnable curl script.
				</Text>
				<Banner
					className="home-hero__callout"
					variant="alert"
					icon={<WarningIcon weight="fill" />}
				>
					<p>
						<strong>Read this first.</strong>{" "}
						<code>POST /services/&#123;id&#125;/update</code> replaces the whole
						ServiceSpec — it is not a patch endpoint. Treat the object below as
						the <em>diff</em> you merge into the spec you read from{" "}
						<code>GET /services/&#123;id&#125;</code>. The curl tab shows that
						flow end to end.
					</p>
				</Banner>
				<Text size="sm">
					<a href={API_DOC_URL} target="_blank" rel="noreferrer">
						Docker Engine API {API_VERSION} — ServiceUpdate reference
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
							label="Find a field"
							description={`${ALL_FIELDS.length} keys across ${SECTIONS.length} sections. Searching matches JSON keys, paths, CLI flags and Compose keys.`}
							value={filter}
							placeholder="MemoryBytes, rollback, --limit-cpu, deploy.resources…"
							onChange={(event) =>
								generatorStore.actions.setFilter(event.target.value)
							}
						/>
					</div>

					{SECTIONS.map((section) => (
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
