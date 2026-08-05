import { useSelector } from "@tanstack/react-store";
import { useId } from "react";
import type { FieldDef, RowColumn } from "#/docker/field-types";
import { generatorStore } from "#/store/generator-store";
import InlineText from "../InlineText";

interface RowsEditorProps {
	field: FieldDef;
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
	if (column.type === "boolean") {
		return (
			<span className="flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
				<input
					id={id}
					type="checkbox"
					checked={value === "true"}
					onChange={(event) => onChange(event.target.checked ? "true" : "")}
					className="h-4 w-4 accent-[var(--lagoon-deep)]"
				/>
				{value === "true" ? "true" : "unset"}
			</span>
		);
	}

	if (column.type === "select") {
		return (
			<select
				id={id}
				className="demo-select"
				value={value}
				onChange={(event) => onChange(event.target.value)}
			>
				<option value="">— unset —</option>
				{column.options?.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		);
	}

	return (
		<input
			id={id}
			className="demo-input"
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
	const scope = useId();
	const rows = useSelector(
		generatorStore,
		(state) => state.states[field.id]?.rows ?? [],
	);
	const columns = field.columns ?? [];

	return (
		<div className="flex flex-col gap-3">
			{rows.length === 0 ? (
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
					No entries yet — the key is omitted from the output.
				</p>
			) : null}

			{rows.map((row, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and carry no stable id
					key={index}
					className="demo-list-item flex flex-col gap-3"
				>
					<div className="flex items-center justify-between gap-3">
						<span className="demo-pill">#{index + 1}</span>
						<button
							type="button"
							className="demo-button demo-button-danger px-3 py-1.5 text-xs"
							onClick={() => generatorStore.actions.removeRow(field.id, index)}
						>
							Remove
						</button>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						{columns.map((column) => {
							const controlId = `${scope}-${index}-${column.key}`;
							return (
								<div key={column.key} className="flex flex-col gap-1.5">
									<label
										htmlFor={controlId}
										className="text-xs font-bold text-[var(--sea-ink)]"
									>
										{column.label}
										<code className="ml-2 font-normal">{column.key}</code>
									</label>
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
									<span className="text-xs text-[var(--sea-ink-soft)]">
										<InlineText text={column.hint} />
									</span>
								</div>
							);
						})}
					</div>
				</div>
			))}

			<div>
				<button
					type="button"
					className="demo-button demo-button-secondary px-3 py-2 text-xs"
					onClick={() => generatorStore.actions.addRow(field.id)}
				>
					+ Add entry
				</button>
			</div>
		</div>
	);
}
