import { Badge, Text } from "@cloudflare/kumo";
import { useSelector } from "@tanstack/react-store";
import { useState } from "react";
import { isFieldActive } from "#/docker/build-spec";
import type { FieldDef, SectionDef } from "#/docker/field-types";
import { type MessageKey, useI18n } from "#/i18n";
import { generatorStore, issuesAtom } from "#/store/generator-store";
import InlineText from "../InlineText";
import FieldEditor from "./FieldEditor";

const SECTION_TITLE_KEYS: Record<string, MessageKey> = {
	service: "section.service",
	mode: "section.mode",
	container: "section.container",
	health: "section.health",
	storage: "section.storage",
	resources: "section.resources",
	restart: "section.restart",
	placement: "section.placement",
	network: "section.network",
	"task-misc": "section.task-misc",
	"update-config": "section.update-config",
	"rollback-config": "section.rollback-config",
	request: "section.request",
} as const;

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
	const { t } = useI18n();
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
		<section className="panel">
			{/*
			 * A native button rather than Kumo's Collapsible: `expanded` is derived
			 * from the search and the active count as well as the click, so a
			 * component that owns its own open state would fight the derivation.
			 */}
			<button
				type="button"
				className="section-panel__toggle"
				aria-expanded={expanded}
				onClick={() => setOpen((previous) => !previous)}
			>
				<span className="section-panel__heading">
					<span className="kicker section-panel__path">
						<code>{section.path}</code>
					</span>
					<Text variant="heading3" as="h2">
						{SECTION_TITLE_KEYS[section.id]
							? t(SECTION_TITLE_KEYS[section.id])
							: section.title}
					</Text>
					<Text variant="secondary" size="sm" as="span">
						<InlineText text={section.summary} />
					</Text>
				</span>
				<span className="section-panel__badges">
					{activeCount > 0 ? (
						<Badge variant="neutral">
							{activeCount} {t("section.set")}
						</Badge>
					) : null}
					<Badge variant="outline">
						{expanded ? t("section.hide") : t("section.show")}
					</Badge>
				</span>
			</button>

			{expanded ? (
				<>
					{section.details?.map((paragraph) => (
						<Text key={paragraph.slice(0, 32)} variant="secondary" size="sm">
							<InlineText text={paragraph} />
						</Text>
					))}

					<div className="section-panel__fields">
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
