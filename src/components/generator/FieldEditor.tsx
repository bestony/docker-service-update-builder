import { useSelector } from "@tanstack/react-store";
import { useId, useState } from "react";
import { describeDerivedValue } from "#/docker/build-spec";
import type { FieldDef } from "#/docker/field-types";
import { BYTE_UNITS, DURATION_UNITS, type UnitOption } from "#/docker/units";
import { generatorStore } from "#/store/generator-store";
import InlineText from "../InlineText";
import RowsEditor from "./RowsEditor";

interface FieldEditorProps {
	field: FieldDef;
	/** Highlighted because a validation issue points at it. */
	flagged?: boolean;
}

function unitsFor(field: FieldDef): Array<UnitOption> | undefined {
	if (field.type === "duration") return DURATION_UNITS;
	if (field.type === "bytes") return BYTE_UNITS;
	return undefined;
}

function isMultiline(field: FieldDef): boolean {
	return field.type === "lines" || field.type === "mapLines";
}

export default function FieldEditor({ field, flagged }: FieldEditorProps) {
	const inputId = useId();
	const [showDetails, setShowDetails] = useState(false);
	const state = useSelector(generatorStore, (store) => store.states[field.id]);

	if (!state) return null;

	const units = unitsFor(field);
	const derived = state.enabled
		? describeDerivedValue(field, state)
		: undefined;
	const actions = generatorStore.actions;

	return (
		<div
			className={`demo-card flex flex-col gap-3 ${
				state.enabled ? "" : "opacity-70"
			} ${flagged ? "border-[rgba(196,71,71,0.45)]" : ""}`}
		>
			<div className="flex flex-wrap items-start gap-3">
				<input
					id={`${inputId}-toggle`}
					type="checkbox"
					checked={state.enabled}
					onChange={(event) =>
						actions.toggleField(field.id, event.target.checked)
					}
					className="mt-1 h-4 w-4 flex-shrink-0 accent-[var(--lagoon-deep)]"
				/>
				<div className="min-w-0 flex-1">
					<label
						htmlFor={`${inputId}-toggle`}
						className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-bold text-[var(--sea-ink)]"
					>
						{field.title}
						<code className="text-xs font-normal">{field.key}</code>
					</label>
					<p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
						<InlineText text={field.summary} />
					</p>
					<p className="m-0 mt-1 text-xs text-[var(--sea-ink-soft)]">
						<code className="text-[0.7rem]">{field.path}</code>
					</p>
				</div>
			</div>

			{state.enabled ? (
				<div className="flex flex-col gap-2">
					{field.type === "rows" ? <RowsEditor field={field} /> : null}

					{field.type === "boolean" ? (
						<label className="flex items-center gap-2 text-sm text-[var(--sea-ink)]">
							<input
								type="checkbox"
								checked={state.value === "true"}
								onChange={(event) =>
									actions.setValue(
										field.id,
										event.target.checked ? "true" : "false",
									)
								}
								className="h-4 w-4 accent-[var(--lagoon-deep)]"
							/>
							<code>{state.value === "true" ? "true" : "false"}</code>
						</label>
					) : null}

					{field.type === "select" ? (
						<div className="flex flex-col gap-2">
							<select
								className="demo-select"
								value={state.value}
								onChange={(event) =>
									actions.setValue(field.id, event.target.value)
								}
							>
								<option value="">— unset —</option>
								{field.options?.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							{field.options
								?.filter((option) => option.value === state.value)
								.map((option) => (
									<p
										key={option.value}
										className="m-0 text-xs text-[var(--sea-ink-soft)]"
									>
										<InlineText text={option.hint} />
									</p>
								))}
						</div>
					) : null}

					{isMultiline(field) ? (
						<textarea
							className="demo-textarea font-mono text-sm"
							value={state.value}
							placeholder={field.placeholder}
							spellCheck={false}
							onChange={(event) =>
								actions.setValue(field.id, event.target.value)
							}
						/>
					) : null}

					{units ? (
						<div className="flex flex-wrap gap-2">
							<input
								className="demo-input demo-input-fit flex-1"
								type="number"
								value={state.value}
								placeholder={field.placeholder}
								onChange={(event) =>
									actions.setValue(field.id, event.target.value)
								}
							/>
							<select
								className="demo-select demo-input-fit"
								value={state.unit ?? units[0].id}
								onChange={(event) =>
									actions.setUnit(field.id, event.target.value)
								}
							>
								{units.map((unit) => (
									<option key={unit.id} value={unit.id}>
										{unit.label}
									</option>
								))}
							</select>
						</div>
					) : null}

					{field.type === "text" ||
					field.type === "number" ||
					field.type === "cpu" ? (
						<input
							className="demo-input"
							type={field.type === "text" ? "text" : "number"}
							step={field.type === "cpu" ? "0.1" : undefined}
							value={state.value}
							placeholder={field.placeholder}
							onChange={(event) =>
								actions.setValue(field.id, event.target.value)
							}
						/>
					) : null}

					{derived ? (
						<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
							Serialises to <code className="text-[0.7rem]">{derived}</code>
						</p>
					) : (
						<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
							Empty — the key is omitted from the generated object.
						</p>
					)}
				</div>
			) : null}

			{field.caution ? (
				<p className="m-0 rounded-lg border border-[rgba(193,126,42,0.3)] bg-[rgba(193,126,42,0.1)] px-3 py-2 text-xs text-[var(--sea-ink)]">
					<InlineText text={field.caution} />
				</p>
			) : null}

			<div>
				<button
					type="button"
					className="text-xs font-bold text-[var(--lagoon-deep)] underline-offset-2 hover:underline"
					onClick={() => setShowDetails((previous) => !previous)}
				>
					{showDetails ? "Hide explanation" : "What does this do?"}
				</button>
			</div>

			{showDetails ? (
				<div className="flex flex-col gap-2 border-t border-[var(--line)] pt-3">
					{field.details.map((paragraph) => (
						<p
							key={paragraph.slice(0, 32)}
							className="m-0 text-sm text-[var(--sea-ink-soft)]"
						>
							<InlineText text={paragraph} />
						</p>
					))}
					<dl className="m-0 grid gap-1 text-xs text-[var(--sea-ink-soft)]">
						{field.apiDefault ? (
							<div className="flex gap-2">
								<dt className="font-bold">API default</dt>
								<dd className="m-0">
									<code className="text-[0.7rem]">{field.apiDefault}</code>
								</dd>
							</div>
						) : null}
						{field.cli ? (
							<div className="flex flex-wrap gap-2">
								<dt className="font-bold">CLI</dt>
								<dd className="m-0">
									<code className="text-[0.7rem]">{field.cli}</code>
								</dd>
							</div>
						) : null}
						{field.compose ? (
							<div className="flex flex-wrap gap-2">
								<dt className="font-bold">Compose</dt>
								<dd className="m-0">
									<code className="text-[0.7rem]">{field.compose}</code>
								</dd>
							</div>
						) : null}
					</dl>
				</div>
			) : null}
		</div>
	);
}
