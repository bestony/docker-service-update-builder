import { Button, Link, Tabs, Text } from "@cloudflare/kumo";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
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

const FORMAT_TABS = FORMATS.map((entry) => ({
	value: entry.id,
	label: entry.label,
}));

/**
 * Tabs reports the active tab as a bare string. Looking the id back up in
 * FORMATS narrows it without a cast, and ignores anything we did not put there.
 */
function selectFormat(value: string) {
	const entry = FORMATS.find((candidate) => candidate.id === value);
	if (entry) generatorStore.actions.setFormat(entry.id);
}

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
		<div className="output-panel">
			<div className="panel">
				<div className="output-panel__header">
					<div className="output-panel__title">
						<p className="kicker">Generated object</p>
						<Text variant="heading3" as="h2">
							{activeCount} field{activeCount === 1 ? "" : "s"} included
						</Text>
					</div>
					<div className="output-panel__actions">
						<CopyButton getText={() => output.text} label="Copy" />
						<Button
							variant="secondary"
							size="sm"
							icon={DownloadSimpleIcon}
							onClick={() => download(output.text, downloadFilename(format))}
						>
							Download
						</Button>
						<CopyButton
							getText={() => window.location.href}
							label="Copy permalink"
						/>
					</div>
				</div>

				<Tabs
					className="output-panel__formats"
					variant="segmented"
					size="sm"
					tabs={FORMAT_TABS}
					value={format}
					onValueChange={selectFormat}
				/>

				<Text variant="secondary" size="xs">
					{FORMATS.find((entry) => entry.id === format)?.hint}
				</Text>

				<pre className="output-panel__code">
					<code>{output.text}</code>
				</pre>

				{format !== "curl" ? (
					<Text variant="secondary" size="xs">
						Endpoint: <code>POST {buildUpdatePath(requestOptions)}</code>
					</Text>
				) : null}

				<Text variant="secondary" size="xs">
					Engine API {API_VERSION} —{" "}
					<Link href={API_DOC_URL} target="_blank" rel="noreferrer">
						ServiceUpdate reference
					</Link>
				</Text>
			</div>

			<IssueList />
		</div>
	);
}
