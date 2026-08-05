import type { JsonValue } from "./build-spec";

/**
 * A small YAML 1.2 emitter for JSON-shaped data.
 *
 * The generated spec is plain JSON, so a dependency-free emitter is enough —
 * and it keeps the app a pure static bundle. The only subtlety is quoting:
 * `Image: 1.27` would parse back as a float, so anything that could be
 * re-interpreted as a scalar of another type gets quoted.
 */

const PLAIN_SAFE = /^[A-Za-z0-9_./@][A-Za-z0-9_\-./@+ ]*$/;
const LOOKS_LIKE_NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;
const RESERVED_WORDS = new Set([
	"true",
	"false",
	"null",
	"yes",
	"no",
	"on",
	"off",
	"~",
	"y",
	"n",
]);

function needsQuotes(value: string): boolean {
	if (value === "") return true;
	if (value !== value.trim()) return true;
	if (RESERVED_WORDS.has(value.toLowerCase())) return true;
	if (LOOKS_LIKE_NUMBER.test(value)) return true;
	if (value.includes(": ") || value.includes(" #")) return true;
	if (!PLAIN_SAFE.test(value)) return true;
	return false;
}

function quote(value: string): string {
	const escaped = value
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n")
		.replace(/\r/g, "\\r")
		.replace(/\t/g, "\\t");
	return `"${escaped}"`;
}

function scalar(value: string | number | boolean | null): string {
	if (value === null) return "null";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "number")
		return Number.isFinite(value) ? String(value) : "null";
	return needsQuotes(value) ? quote(value) : value;
}

function quoteKey(key: string): string {
	return needsQuotes(key) ? quote(key) : key;
}

function isContainer(value: JsonValue): boolean {
	return typeof value === "object" && value !== null;
}

function isEmptyContainer(value: JsonValue): boolean {
	if (Array.isArray(value)) return value.length === 0;
	if (isContainer(value)) return Object.keys(value as object).length === 0;
	return false;
}

function emit(value: JsonValue, indent: number): Array<string> {
	const pad = "  ".repeat(indent);

	if (Array.isArray(value)) {
		if (value.length === 0) return [`${pad}[]`];
		return value.flatMap((item) => {
			if (!isContainer(item) || isEmptyContainer(item)) {
				return [
					`${pad}- ${
						isEmptyContainer(item)
							? Array.isArray(item)
								? "[]"
								: "{}"
							: scalar(item as string | number | boolean | null)
					}`,
				];
			}
			// Render the first line of the nested block inline after the dash.
			const nested = emit(item, indent + 1);
			const first = nested[0].slice((indent + 1) * 2);
			return [`${pad}- ${first}`, ...nested.slice(1)];
		});
	}

	if (isContainer(value)) {
		const entries = Object.entries(value as Record<string, JsonValue>);
		if (entries.length === 0) return [`${pad}{}`];
		return entries.flatMap(([key, child]) => {
			if (!isContainer(child) || isEmptyContainer(child)) {
				const rendered = isEmptyContainer(child)
					? Array.isArray(child)
						? "[]"
						: "{}"
					: scalar(child as string | number | boolean | null);
				return [`${pad}${quoteKey(key)}: ${rendered}`];
			}
			return [`${pad}${quoteKey(key)}:`, ...emit(child, indent + 1)];
		});
	}

	return [`${pad}${scalar(value as string | number | boolean | null)}`];
}

export function toYaml(value: JsonValue): string {
	if (isEmptyContainer(value)) return "{}\n";
	return `${emit(value, 0).join("\n")}\n`;
}
