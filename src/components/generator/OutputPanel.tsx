import { Button, Link, Tabs, Text } from "@cloudflare/kumo";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useSelector } from "@tanstack/react-store";
import { countActiveFields } from "#/docker/build-spec";
import { API_DOC_URL, API_VERSION, buildUpdatePath } from "#/docker/request";
import { useI18n } from "#/i18n";
import type { OutputFormat } from "#/store/generator-store";
import {
	generatorStore,
	outputAtom,
	requestOptionsAtom,
} from "#/store/generator-store";
import CopyButton from "./CopyButton";
import IssueList from "./IssueList";

const FORMATS: Array<{ id: OutputFormat; label: string }> = [
	{ id: "json", label: "JSON" },
	{ id: "yaml", label: "YAML" },
	{ id: "curl", label: "curl" },
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
	const { t } = useI18n();
	const format = useSelector(generatorStore, (state) => state.format);
	const activeCount = useSelector(generatorStore, (state) =>
		countActiveFields(state.states),
	);
	const output = useSelector(outputAtom);
	const requestOptions = useSelector(requestOptionsAtom);
	const formatHint =
		format === "json"
			? t("output.jsonHint")
			: format === "yaml"
				? t("output.yamlHint")
				: t("output.curlHint");

	return (
		<div className="output-panel">
			<div className="panel">
				<div className="output-panel__header">
					<div className="output-panel__title">
						<p className="kicker">{t("output.generated")}</p>
						<Text variant="heading3" as="h2">
							{t("output.fieldsIncluded", {
								count: activeCount,
								suffix: activeCount === 1 ? "" : "s",
							})}
						</Text>
					</div>
					<div className="output-panel__actions">
						<CopyButton getText={() => output.text} label={t("output.copy")} />
						<Button
							variant="secondary"
							size="sm"
							icon={DownloadSimpleIcon}
							onClick={() => download(output.text, downloadFilename(format))}
						>
							{t("output.download")}
						</Button>
						<CopyButton
							getText={() => window.location.href}
							label={t("output.copyPermalink")}
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
					{formatHint}
				</Text>

				<pre className="output-panel__code">
					<code>{output.text}</code>
				</pre>

				{format !== "curl" ? (
					<Text variant="secondary" size="xs">
						{t("output.endpoint")}{" "}
						<code>POST {buildUpdatePath(requestOptions)}</code>
					</Text>
				) : null}

				<Text variant="secondary" size="xs">
					Engine API {API_VERSION} —{" "}
					<Link href={API_DOC_URL} target="_blank" rel="noreferrer">
						{t("output.apiReference")}
					</Link>
				</Text>
			</div>

			<IssueList />
		</div>
	);
}
