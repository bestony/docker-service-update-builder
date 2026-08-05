import { SPEC_SECTIONS } from "./catalog";
import type { FieldDef, FieldState, RowColumn } from "./field-types";
import {
	BYTE_UNITS,
	DURATION_UNITS,
	findUnit,
	formatBytes,
	formatDurationNs,
	formatNanoCpus,
	NANO_CPUS_PER_CORE,
	parseAmount,
} from "./units";

export type FieldStates = Record<string, FieldState>;

export type JsonValue =
	| string
	| number
	| boolean
	| null
	| Array<JsonValue>
	| { [key: string]: JsonValue };

function isPlainObject(value: unknown): value is Record<string, JsonValue> {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		Object.getPrototypeOf(value) === Object.prototype
	);
}

/**
 * Writes `value` at a dot path, merging plain objects instead of replacing
 * them. Merging matters because several fields share a parent — `Limits.Pids`
 * and `Limits.MemoryBytes` both have to land inside the same `Limits` object.
 */
export function setAtPath(
	target: Record<string, JsonValue>,
	path: string,
	value: JsonValue,
): void {
	const segments = path.split(".");
	let cursor = target;

	for (let index = 0; index < segments.length - 1; index += 1) {
		const segment = segments[index];
		const existing = cursor[segment];
		if (!isPlainObject(existing)) {
			cursor[segment] = {};
		}
		cursor = cursor[segment] as Record<string, JsonValue>;
	}

	const leaf = segments[segments.length - 1];
	const existing = cursor[leaf];
	cursor[leaf] =
		isPlainObject(existing) && isPlainObject(value)
			? { ...existing, ...value }
			: value;
}

function splitLines(raw: string): Array<string> {
	return raw
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line !== "");
}

function parseKeyValueLines(raw: string): Record<string, JsonValue> {
	const result: Record<string, JsonValue> = {};
	for (const line of splitLines(raw)) {
		const separator = line.indexOf("=");
		if (separator === -1) {
			result[line] = "";
			continue;
		}
		result[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
	}
	return result;
}

function cellValue(column: RowColumn, raw: string): JsonValue | undefined {
	const trimmed = raw.trim();
	if (trimmed === "") return undefined;

	if (column.split === "comma") {
		const parts = trimmed
			.split(",")
			.map((part) => part.trim())
			.filter((part) => part !== "");
		return parts.length > 0 ? parts : undefined;
	}

	switch (column.type) {
		case "number": {
			const parsed = parseAmount(trimmed);
			return parsed === undefined ? undefined : parsed;
		}
		case "boolean":
			return trimmed === "true";
		default:
			return trimmed;
	}
}

function buildRow(
	columns: Array<RowColumn>,
	row: Record<string, string>,
): Record<string, JsonValue> | undefined {
	const item: Record<string, JsonValue> = {};
	let touched = false;

	for (const column of columns) {
		const value = cellValue(column, row[column.key] ?? "");
		if (value === undefined) continue;
		setAtPath(item, column.key, value);
		touched = true;
	}

	return touched ? item : undefined;
}

/**
 * Converts one field's editor state into the JSON value the Engine API expects.
 * Returns `undefined` when the field contributes nothing, so callers can simply
 * skip the key rather than emitting nulls or empty containers.
 */
export function toJsonValue(
	field: FieldDef,
	state: FieldState,
): JsonValue | undefined {
	switch (field.type) {
		case "boolean":
			return state.value === "true";

		case "select": {
			if (state.value.trim() === "") return undefined;
			if (field.valueMap) {
				return (
					(field.valueMap[state.value] as JsonValue | undefined) ?? undefined
				);
			}
			return state.value;
		}

		case "number": {
			const parsed = parseAmount(state.value);
			return parsed === undefined ? undefined : parsed;
		}

		case "duration": {
			const amount = parseAmount(state.value);
			if (amount === undefined) return undefined;
			return Math.round(amount * findUnit(DURATION_UNITS, state.unit).factor);
		}

		case "bytes": {
			const amount = parseAmount(state.value);
			if (amount === undefined) return undefined;
			return Math.round(amount * findUnit(BYTE_UNITS, state.unit).factor);
		}

		case "cpu": {
			const amount = parseAmount(state.value);
			if (amount === undefined) return undefined;
			return Math.round(amount * NANO_CPUS_PER_CORE);
		}

		case "lines": {
			const lines = splitLines(state.value);
			return lines.length > 0 ? lines : undefined;
		}

		case "mapLines": {
			const map = parseKeyValueLines(state.value);
			return Object.keys(map).length > 0 ? map : undefined;
		}

		case "rows": {
			const columns = field.columns ?? [];
			const items = (state.rows ?? [])
				.map((row) => buildRow(columns, row))
				.filter(
					(item): item is Record<string, JsonValue> => item !== undefined,
				);
			return items.length > 0 ? items : undefined;
		}

		default: {
			const trimmed = state.value.trim();
			if (trimmed === "") return undefined;
			// MaxFailureRatio is the one text field the API wants as a number.
			if (field.key === "MaxFailureRatio") {
				const parsed = parseAmount(trimmed);
				return parsed === undefined ? trimmed : parsed;
			}
			return trimmed;
		}
	}
}

export function isFieldActive(field: FieldDef, state: FieldState): boolean {
	if (!state.enabled) return false;
	return toJsonValue(field, state) !== undefined;
}

/** Builds the JSON body of `POST /services/{id}/update`. */
export function buildServiceSpec(
	states: FieldStates,
): Record<string, JsonValue> {
	const spec: Record<string, JsonValue> = {};

	for (const section of SPEC_SECTIONS) {
		for (const field of section.fields) {
			const state = states[field.id];
			if (!state?.enabled) continue;
			const value = toJsonValue(field, state);
			if (value === undefined) continue;
			setAtPath(spec, field.path, value);
		}
	}

	return spec;
}

export interface UpdateRequestOptions {
	serviceId: string;
	version: string;
	rollback: string;
	registryAuthFrom: string;
}

export function buildRequestOptions(states: FieldStates): UpdateRequestOptions {
	const read = (id: string) => {
		const state = states[id];
		return state?.enabled ? state.value.trim() : "";
	};

	return {
		serviceId: read("req-service-id") || "<service-id>",
		version: read("req-version"),
		rollback: read("req-rollback"),
		registryAuthFrom: read("req-registry-auth-from"),
	};
}

/** Human-readable echo of what a field serialises to, shown under the input. */
export function describeDerivedValue(
	field: FieldDef,
	state: FieldState,
): string | undefined {
	const value = toJsonValue(field, state);
	if (value === undefined) return undefined;

	switch (field.type) {
		case "duration":
			return `${value} ns — ${formatDurationNs(value as number)}`;
		case "bytes":
			return `${value} bytes — ${formatBytes(value as number)}`;
		case "cpu":
			return `${value} nano CPUs — ${formatNanoCpus(value as number)}`;
		case "lines":
		case "rows":
			return `${(value as Array<unknown>).length} entr${
				(value as Array<unknown>).length === 1 ? "y" : "ies"
			}`;
		case "mapLines":
			return `${Object.keys(value as object).length} key(s)`;
		default:
			return JSON.stringify(value);
	}
}

/** Counts only body fields — request options do not appear in the output. */
export function countActiveFields(states: FieldStates): number {
	return SPEC_SECTIONS.flatMap((section) => section.fields).filter((field) => {
		const state = states[field.id];
		return state ? isFieldActive(field, state) : false;
	}).length;
}
