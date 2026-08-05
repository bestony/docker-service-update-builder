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
		<main className="demo-page demo-page-wide flex flex-col gap-6">
			<section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12">
				<div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
				<p className="island-kicker mb-3">
					Docker Engine API {API_VERSION} · ServiceUpdate
				</p>
				<h1 className="display-title mb-4 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
					Build a service update object you can actually explain.
				</h1>
				<p className="m-0 mb-4 max-w-3xl text-base text-[var(--sea-ink-soft)]">
					Tick the keys you want to change, in units humans use. Every field
					carries the reasoning behind it, the CLI flag it maps to, and the
					Compose key it corresponds to. The result exports as JSON, YAML or a
					runnable curl script.
				</p>
				<p className="m-0 max-w-3xl rounded-xl border border-[rgba(193,126,42,0.3)] bg-[rgba(193,126,42,0.1)] px-4 py-3 text-sm text-[var(--sea-ink)]">
					<strong>Read this first.</strong>{" "}
					<code>POST /services/&#123;id&#125;/update</code> replaces the whole
					ServiceSpec — it is not a patch endpoint. Treat the object below as
					the <em>diff</em> you merge into the spec you read from{" "}
					<code>GET /services/&#123;id&#125;</code>. The curl tab shows that
					flow end to end.
				</p>
				<p className="m-0 mt-4 text-sm">
					<a href={API_DOC_URL} target="_blank" rel="noreferrer">
						Docker Engine API {API_VERSION} — ServiceUpdate reference
					</a>
				</p>
			</section>

			<PresetBar />

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-start">
				<div className="flex flex-col gap-4">
					<div className="demo-panel flex flex-col gap-2">
						<label
							htmlFor="field-filter"
							className="text-sm font-bold text-[var(--sea-ink)]"
						>
							Find a field
						</label>
						<input
							id="field-filter"
							className="demo-input"
							type="search"
							value={filter}
							placeholder="MemoryBytes, rollback, --limit-cpu, deploy.resources…"
							onChange={(event) =>
								generatorStore.actions.setFilter(event.target.value)
							}
						/>
						<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
							{ALL_FIELDS.length} keys across {SECTIONS.length} sections.
							Searching matches JSON keys, paths, CLI flags and Compose keys.
						</p>
					</div>

					{SECTIONS.map((section) => (
						<SectionPanel key={section.id} section={section} filter={filter} />
					))}
				</div>

				<div className="flex flex-col gap-4 lg:sticky lg:top-24">
					<OutputPanel />
					<FurtherReading />
				</div>
			</div>
		</main>
	);
}
