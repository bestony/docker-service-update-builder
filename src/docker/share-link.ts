import type { FieldStates } from "./build-spec";
import { FIELDS_BY_ID } from "./catalog";
import { createInitialStates } from "./presets";

/**
 * Compact wire format for a builder session.
 *
 * Only enabled fields are written, and the keys are single letters, because the
 * whole thing rides in a query string. It is deliberately a *lossy* snapshot:
 * unknown field ids are dropped on read so an old permalink still opens after
 * the catalog changes.
 */
interface WireField {
	v?: string;
	u?: string;
	r?: Array<Record<string, string>>;
}

type Wire = Record<string, WireField>;

function toBase64Url(input: string): string {
	const bytes = new TextEncoder().encode(input);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
	const padded = input
		.replace(/-/g, "+")
		.replace(/_/g, "/")
		.padEnd(Math.ceil(input.length / 4) * 4, "=");
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

export function encodeStates(states: FieldStates): string {
	const wire: Wire = {};

	for (const [fieldId, state] of Object.entries(states)) {
		if (!state.enabled) continue;
		const entry: WireField = {};
		if (state.value !== "") entry.v = state.value;
		if (state.unit) entry.u = state.unit;
		if (state.rows && state.rows.length > 0) entry.r = state.rows;
		wire[fieldId] = entry;
	}

	if (Object.keys(wire).length === 0) return "";
	return toBase64Url(JSON.stringify(wire));
}

export function decodeStates(encoded: string): FieldStates {
	const states = createInitialStates();
	if (!encoded) return states;

	let wire: Wire;
	try {
		const parsed: unknown = JSON.parse(fromBase64Url(encoded));
		if (typeof parsed !== "object" || parsed === null) return states;
		wire = parsed as Wire;
	} catch {
		// A truncated or hand-edited link should open an empty builder, not crash.
		return states;
	}

	for (const [fieldId, entry] of Object.entries(wire)) {
		const field = FIELDS_BY_ID.get(fieldId);
		const base = states[fieldId];
		if (!field || !base || typeof entry !== "object" || entry === null)
			continue;

		states[fieldId] = {
			enabled: true,
			value: typeof entry.v === "string" ? entry.v : "",
			unit: typeof entry.u === "string" ? entry.u : base.unit,
			rows: Array.isArray(entry.r) ? entry.r : base.rows,
		};
	}

	return states;
}
