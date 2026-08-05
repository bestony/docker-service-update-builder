import { useSelector } from "@tanstack/react-store";
import { useState } from "react";
import { isFieldActive } from "#/docker/build-spec";
import type { FieldDef, SectionDef } from "#/docker/field-types";
import { generatorStore, issuesAtom } from "#/store/generator-store";
import InlineText from "../InlineText";
import FieldEditor from "./FieldEditor";

interface SectionPanelProps {
	section: SectionDef;
	filter: string;
}

function matches(field: FieldDef, needle: string): boolean {
	if (needle === "") return true;
	const haystack = [
		field.id,
		field.key,
		field.path,
		field.title,
		field.summary,
		field.cli ?? "",
		field.compose ?? "",
	]
		.join(" ")
		.toLowerCase();
	return haystack.includes(needle);
}

export default function SectionPanel({ section, filter }: SectionPanelProps) {
	const needle = filter.trim().toLowerCase();
	const visibleFields = section.fields.filter((field) =>
		matches(field, needle),
	);
	const activeCount = useSelector(
		generatorStore,
		(state) =>
			section.fields.filter((field) => {
				const fieldState = state.states[field.id];
				return fieldState ? isFieldActive(field, fieldState) : false;
			}).length,
	);
	const flagged = useSelector(issuesAtom, (issues) => {
		const ids = new Set<string>();
		for (const issue of issues) {
			if (issue.level === "info") continue;
			for (const fieldId of issue.fieldIds) ids.add(fieldId);
		}
		return ids;
	});
	// Sections start collapsed unless they carry configuration or the user is
	// searching — a 60-field wall of inputs is not a usable starting screen.
	const [open, setOpen] = useState(false);
	const expanded = open || needle !== "" || activeCount > 0;

	if (visibleFields.length === 0) return null;

	return (
		<section className="demo-panel flex flex-col gap-3">
			<button
				type="button"
				className="flex flex-wrap items-center justify-between gap-3 text-left"
				onClick={() => setOpen((previous) => !previous)}
			>
				<div className="min-w-0">
					<p className="island-kicker mb-1">
						<code className="text-[0.7rem]">{section.path}</code>
					</p>
					<h2 className="demo-section-title">{section.title}</h2>
					<p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
						<InlineText text={section.summary} />
					</p>
				</div>
				<div className="flex flex-shrink-0 items-center gap-2">
					{activeCount > 0 ? (
						<span className="demo-pill">{activeCount} set</span>
					) : null}
					<span className="demo-pill">{expanded ? "Hide" : "Show"}</span>
				</div>
			</button>

			{expanded ? (
				<>
					{section.details?.map((paragraph) => (
						<p
							key={paragraph.slice(0, 32)}
							className="m-0 text-sm text-[var(--sea-ink-soft)]"
						>
							<InlineText text={paragraph} />
						</p>
					))}

					<div className="grid gap-3">
						{visibleFields.map((field) => (
							<FieldEditor
								key={field.id}
								field={field}
								flagged={flagged.has(field.id)}
							/>
						))}
					</div>
				</>
			) : null}
		</section>
	);
}
