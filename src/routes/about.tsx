import { createFileRoute, Link } from "@tanstack/react-router";
import { ALL_FIELDS, SECTIONS } from "#/docker/catalog";
import { PRESETS } from "#/docker/presets";
import { API_DOC_URL, API_VERSION } from "#/docker/request";

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
	return (
		<main className="demo-page flex flex-col gap-6">
			<section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10">
				<p className="island-kicker mb-3">About</p>
				<h1 className="display-title mb-4 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
					A visual editor for one specific JSON object.
				</h1>
				<p className="m-0 max-w-3xl text-base text-[var(--sea-ink-soft)]">
					The Docker Engine API's <code>ServiceUpdate</code> body is deeply
					nested, unit-free and unforgiving. This builder covers{" "}
					{ALL_FIELDS.length} keys across {SECTIONS.length} sections of Engine
					API {API_VERSION}, explains each one in plain language, and exports
					the result as JSON, YAML or a runnable curl script.
				</p>
			</section>

			<section className="demo-panel flex flex-col gap-3">
				<h2 className="demo-section-title">How it works</h2>
				<ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
					<li>
						Every key is described as data in <code>src/docker/catalog/</code> —
						its JSON path, editor type, prose, CLI flag and Compose equivalent.
						Adding coverage is a data change, never a component change.
					</li>
					<li>
						Numbers are edited in human units and serialised to the raw scalars
						the API wants: nanoseconds, bytes and nano-CPUs.
					</li>
					<li>
						Only the keys you tick are emitted, which is what makes the output a
						usable diff rather than a whole spec.
					</li>
					<li>
						A cross-field review flags the combinations the daemon rejects —
						dnsrr with published ports, start-first with host-mode ports,
						reservations above limits, and more.
					</li>
					<li>
						{PRESETS.length} presets encode complete, defensible configurations
						rather than single keys.
					</li>
				</ul>
			</section>

			<section className="demo-panel flex flex-col gap-3">
				<h2 className="demo-section-title">Stack</h2>
				<dl className="m-0 flex flex-col gap-3">
					{STACK.map(([name, description]) => (
						<div key={name}>
							<dt className="text-sm font-bold text-[var(--sea-ink)]">
								{name}
							</dt>
							<dd className="m-0 text-sm text-[var(--sea-ink-soft)]">
								{description}
							</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="demo-panel flex flex-col gap-3">
				<h2 className="demo-section-title">Scope and honesty</h2>
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
					This app never talks to a Docker daemon. It has no backend, holds no
					credentials, and cannot apply anything — it produces text you review
					and run yourself. That is deliberate: the dangerous part of a service
					update is the merge, and a tool that hides the merge would be worse
					than no tool.
				</p>
				<p className="m-0 text-sm">
					<a href={API_DOC_URL} target="_blank" rel="noreferrer">
						Engine API {API_VERSION} — ServiceUpdate reference
					</a>{" "}
					· <Link to="/blog">Field guide</Link> · <Link to="/">Builder</Link>
				</p>
			</section>
		</main>
	);
}
