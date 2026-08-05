import { useSelector } from "@tanstack/react-store";
import { countActiveFields } from "#/docker/build-spec";
import { API_DOC_URL, API_VERSION, buildUpdatePath } from "#/docker/request";
import type { OutputFormat } from "#/store/generator-store";
import {
	generatorStore,
	outputAtom,
	requestOptionsAtom,
} from "#/store/generator-store";
import CopyButton from "./CopyButton";
import IssueList from "./IssueList";

const FORMATS: Array<{ id: OutputFormat; label: string; hint: string }> = [
	{ id: "json", label: "JSON", hint: "The request body, ready to POST." },
	{
		id: "yaml",
		label: "YAML",
		hint: "The same object, easier to review in a PR.",
	},
	{
		id: "curl",
		label: "curl",
		hint: "The full read-modify-write flow against the Docker socket.",
	},
];

function downloadFilename(format: OutputFormat): string {
	if (format === "yaml") return "service-update.yaml";
	if (format === "curl") return "service-update.sh";
	return "service-update.json";
}

function download(text: string, filename: string) {
	const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}

export default function OutputPanel() {
	const format = useSelector(generatorStore, (state) => state.format);
	const activeCount = useSelector(generatorStore, (state) =>
		countActiveFields(state.states),
	);
	const output = useSelector(outputAtom);
	const requestOptions = useSelector(requestOptionsAtom);

	return (
		<div className="flex flex-col gap-4">
			<div className="demo-panel flex flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="island-kicker mb-1">Generated object</p>
						<h2 className="demo-section-title">
							{activeCount} field{activeCount === 1 ? "" : "s"} included
						</h2>
					</div>
					<div className="flex flex-wrap gap-2">
						<CopyButton getText={() => output.text} label="Copy" />
						<button
							type="button"
							className="demo-button demo-button-secondary px-3 py-2 text-xs"
							onClick={() => download(output.text, downloadFilename(format))}
						>
							Download
						</button>
						<CopyButton
							getText={() => window.location.href}
							label="Copy permalink"
						/>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{FORMATS.map((entry) => (
						<button
							key={entry.id}
							type="button"
							title={entry.hint}
							className={`demo-button px-3 py-2 text-xs ${
								format === entry.id ? "" : "demo-button-secondary"
							}`}
							onClick={() => generatorStore.actions.setFormat(entry.id)}
						>
							{entry.label}
						</button>
					))}
				</div>

				<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
					{FORMATS.find((entry) => entry.id === format)?.hint}
				</p>

				<pre className="demo-code-block m-0 max-h-[28rem] overflow-auto text-xs leading-relaxed">
					<code>{output.text}</code>
				</pre>

				{format !== "curl" ? (
					<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
						Endpoint:{" "}
						<code className="text-[0.7rem]">
							POST {buildUpdatePath(requestOptions)}
						</code>
					</p>
				) : null}

				<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
					Engine API {API_VERSION} —{" "}
					<a href={API_DOC_URL} target="_blank" rel="noreferrer">
						ServiceUpdate reference
					</a>
				</p>
			</div>

			<IssueList />
		</div>
	);
}
