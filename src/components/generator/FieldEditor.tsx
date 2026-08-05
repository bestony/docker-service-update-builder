import {
	Banner,
	Button,
	Checkbox,
	Input,
	InputArea,
	Select,
	Text,
} from "@cloudflare/kumo";
import { useSelector } from "@tanstack/react-store";
import { useState } from "react";
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

const UNSET_LABEL = "— unset —";

export default function FieldEditor({ field, flagged }: FieldEditorProps) {
	const [showDetails, setShowDetails] = useState(false);
	const state = useSelector(generatorStore, (store) => store.states[field.id]);

	if (!state) return null;

	const units = unitsFor(field);
	const derived = state.enabled
		? describeDerivedValue(field, state)
		: undefined;
	const actions = generatorStore.actions;

	// A closed Kumo Select cannot read the labels off its `Select.Option`
	// children — those only exist while the popup is open — so left alone the
	// trigger prints the raw Engine API value. Resolve the label from the
	// catalog instead, the way the native `<select>` used to.
	const renderOptionLabel = (value: string) =>
		field.options?.find((option) => option.value === value)?.label ?? value;

	const cardClass = [
		"field-editor",
		flagged ? "field-editor--flagged" : "",
		state.enabled ? "" : "field-editor--dimmed",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={cardClass}>
			<div className="field-editor__header">
				{/*
				 * The label is the checkbox's accessible name, so it carries both
				 * names the field goes by and nothing else — the summary and the
				 * path below would only make that name longer to listen to.
				 */}
				<Checkbox
					checked={state.enabled}
					onCheckedChange={(checked) => actions.toggleField(field.id, checked)}
					label={
						<span className="field-editor__title">
							{field.title}
							<code>{field.key}</code>
						</span>
					}
				/>
				<p className="field-editor__summary">
					<InlineText text={field.summary} />
				</p>
				<p className="field-editor__path">
					<code>{field.path}</code>
				</p>
			</div>

			{state.enabled ? (
				<div className="field-editor__controls">
					{field.type === "rows" ? <RowsEditor field={field} /> : null}

					{field.type === "boolean" ? (
						<Checkbox
							checked={state.value === "true"}
							onCheckedChange={(checked) =>
								actions.setValue(field.id, checked ? "true" : "false")
							}
							label={<code>{state.value === "true" ? "true" : "false"}</code>}
						/>
					) : null}

					{field.type === "select" ? (
						<div className="field-editor__choice">
							<Select
								aria-label={field.title}
								value={state.value}
								onValueChange={(value) =>
									actions.setValue(field.id, value ?? "")
								}
								placeholder={UNSET_LABEL}
								renderValue={renderOptionLabel}
							>
								<Select.Option value="">{UNSET_LABEL}</Select.Option>
								{field.options?.map((option) => (
									<Select.Option key={option.value} value={option.value}>
										{option.label}
									</Select.Option>
								))}
							</Select>
							{field.options
								?.filter((option) => option.value === state.value)
								.map((option) => (
									<Text key={option.value} variant="secondary" size="xs">
										<InlineText text={option.hint} />
									</Text>
								))}
						</div>
					) : null}

					{isMultiline(field) ? (
						<InputArea
							className="field-editor__lines"
							aria-label={field.title}
							value={state.value}
							placeholder={field.placeholder}
							spellCheck={false}
							onChange={(event) =>
								actions.setValue(field.id, event.target.value)
							}
						/>
					) : null}

					{units ? (
						<div className="field-editor__units">
							<Input
								className="field-editor__amount"
								type="number"
								aria-label={field.title}
								value={state.value}
								placeholder={field.placeholder}
								onChange={(event) =>
									actions.setValue(field.id, event.target.value)
								}
							/>
							<Select
								aria-label="Unit"
								value={state.unit ?? units[0].id}
								onValueChange={(value) =>
									actions.setUnit(field.id, value ?? units[0].id)
								}
								renderValue={(value) =>
									units.find((unit) => unit.id === value)?.label ?? value
								}
							>
								{units.map((unit) => (
									<Select.Option key={unit.id} value={unit.id}>
										{unit.label}
									</Select.Option>
								))}
							</Select>
						</div>
					) : null}

					{field.type === "text" ||
					field.type === "number" ||
					field.type === "cpu" ? (
						<Input
							className="field-editor__input"
							type={field.type === "text" ? "text" : "number"}
							step={field.type === "cpu" ? "0.1" : undefined}
							aria-label={field.title}
							value={state.value}
							placeholder={field.placeholder}
							onChange={(event) =>
								actions.setValue(field.id, event.target.value)
							}
						/>
					) : null}

					{derived ? (
						<Text variant="secondary" size="xs">
							Serialises to <code>{derived}</code>
						</Text>
					) : (
						<Text variant="secondary" size="xs">
							Empty — the key is omitted from the generated object.
						</Text>
					)}
				</div>
			) : null}

			{field.caution ? (
				<Banner
					variant="alert"
					size="sm"
					description={<InlineText text={field.caution} />}
				/>
			) : null}

			<Button
				className="field-editor__disclosure"
				variant="ghost"
				size="xs"
				aria-expanded={showDetails}
				onClick={() => setShowDetails((previous) => !previous)}
			>
				{showDetails ? "Hide explanation" : "What does this do?"}
			</Button>

			{showDetails ? (
				<div className="field-editor__details">
					{field.details.map((paragraph) => (
						<Text key={paragraph.slice(0, 32)} variant="secondary" size="sm">
							<InlineText text={paragraph} />
						</Text>
					))}
					<dl className="field-editor__meta">
						{field.apiDefault ? (
							<div className="field-editor__meta-row">
								<dt>API default</dt>
								<dd>
									<code>{field.apiDefault}</code>
								</dd>
							</div>
						) : null}
						{field.cli ? (
							<div className="field-editor__meta-row">
								<dt>CLI</dt>
								<dd>
									<code>{field.cli}</code>
								</dd>
							</div>
						) : null}
						{field.compose ? (
							<div className="field-editor__meta-row">
								<dt>Compose</dt>
								<dd>
									<code>{field.compose}</code>
								</dd>
							</div>
						) : null}
					</dl>
				</div>
			) : null}
		</div>
	);
}
