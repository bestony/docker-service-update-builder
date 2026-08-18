import { Badge, Button, Checkbox, Input, Select, Text } from "@cloudflare/kumo";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useSelector } from "@tanstack/react-store";
import { useId } from "react";
import type { FieldDef, RowColumn } from "#/docker/field-types";
import { useI18n } from "#/i18n";
import { generatorStore } from "#/store/generator-store";
import InlineText from "../InlineText";

interface RowsEditorProps {
	field: FieldDef;
}

/**
 * The column heading: the human label plus the literal JSON key.
 *
 * Kumo's Checkbox renders a `<span role="checkbox">` and takes no `id`, so a
 * boolean column has nothing a `<label for>` could point at — that one heading
 * degrades to a `<span>` and the control names itself with `aria-label`.
 */
function ColumnLabel({
	column,
	controlId,
}: {
	column: RowColumn;
	controlId: string;
}) {
	const content = (
		<>
			{column.label}
			<code>{column.key}</code>
		</>
	);

	if (column.type === "boolean") {
		return <span className="rows-editor__label">{content}</span>;
	}

	return (
		<label className="rows-editor__label" htmlFor={controlId}>
			{content}
		</label>
	);
}

function Cell({
	id,
	column,
	value,
	onChange,
}: {
	id: string;
	column: RowColumn;
	value: string;
	onChange: (next: string) => void;
}) {
	const { t } = useI18n();
	if (column.type === "boolean") {
		return (
			<span className="rows-editor__toggle">
				<Checkbox
					checked={value === "true"}
					onCheckedChange={(checked) => onChange(checked ? "true" : "")}
					aria-label={column.label}
				/>
				{/*
				 * The state word is an echo of the checkbox, not its name — Kumo's
				 * `label` prop would wire it up as `aria-labelledby`, which outranks
				 * `aria-label` and would leave the control announcing itself as
				 * "unset" instead of naming the column.
				 */}
				<span aria-hidden="true">{value === "true" ? "true" : "unset"}</span>
			</span>
		);
	}

	if (column.type === "select") {
		// The closed trigger cannot read the labels off its `Select.Option`
		// children — they only exist while the popup is open — so left alone it
		// would print the raw value. Resolve the label from the catalog instead.
		const renderValue = (next: string) =>
			column.options?.find((option) => option.value === next)?.label ?? next;

		return (
			<Select
				id={id}
				aria-label={column.label}
				value={value}
				onValueChange={(next) => onChange(next ?? "")}
				placeholder={t("field.unset")}
				renderValue={renderValue}
			>
				<Select.Option value="">{t("field.unset")}</Select.Option>
				{column.options?.map((option) => (
					<Select.Option key={option.value} value={option.value}>
						{option.label}
					</Select.Option>
				))}
			</Select>
		);
	}

	return (
		<Input
			id={id}
			aria-label={column.label}
			type={column.type === "number" ? "number" : "text"}
			value={value}
			placeholder={column.placeholder}
			onChange={(event) => onChange(event.target.value)}
		/>
	);
}

/**
 * Repeatable structured rows (mounts, ports, ulimits...). Every column carries
 * its own explanation, because the array item shapes are where the Engine API
 * is least guessable.
 */
export default function RowsEditor({ field }: RowsEditorProps) {
	const { t } = useI18n();
	const scope = useId();
	const rows = useSelector(
		generatorStore,
		(state) => state.states[field.id]?.rows ?? [],
	);
	const columns = field.columns ?? [];

	return (
		<div className="rows-editor">
			{rows.length === 0 ? (
				<Text variant="secondary" size="sm">
					{t("rows.noEntries")}
				</Text>
			) : null}

			{rows.map((row, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and carry no stable id
					key={index}
					className="rows-editor__row"
				>
					<div className="rows-editor__row-header">
						<Badge variant="neutral">#{index + 1}</Badge>
						<Button
							variant="secondary-destructive"
							size="xs"
							icon={TrashIcon}
							onClick={() => generatorStore.actions.removeRow(field.id, index)}
						>
							{t("rows.remove")}
						</Button>
					</div>

					<div className="rows-editor__grid">
						{columns.map((column) => {
							const controlId = `${scope}-${index}-${column.key}`;
							return (
								<div
									key={column.key}
									className="rows-editor__cell"
									data-width={column.width}
								>
									<ColumnLabel column={column} controlId={controlId} />
									<Cell
										id={controlId}
										column={column}
										value={row[column.key] ?? ""}
										onChange={(next) =>
											generatorStore.actions.setCell(
												field.id,
												index,
												column.key,
												next,
											)
										}
									/>
									<Text variant="secondary" size="xs" as="span">
										<InlineText text={column.hint} />
									</Text>
								</div>
							);
						})}
					</div>
				</div>
			))}

			<div className="rows-editor__actions">
				<Button
					variant="secondary"
					size="sm"
					icon={PlusIcon}
					onClick={() => generatorStore.actions.addRow(field.id)}
				>
					{t("rows.addEntry")}
				</Button>
			</div>
		</div>
	);
}
