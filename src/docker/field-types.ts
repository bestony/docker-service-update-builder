/**
 * The declarative field model behind the visual builder.
 *
 * Every knob of the Docker `ServiceSpec` is described as data — its JSON path,
 * how it is edited, and above all *what it means*. The UI is a generic renderer
 * over this catalog, so adding coverage for another Engine API field is a data
 * change, never a component change.
 */

export type FieldType =
	/** Plain single line string. */
	| "text"
	/** Raw integer, serialised as-is. */
	| "number"
	/** Checkbox, serialised as a JSON boolean. */
	| "boolean"
	/** Fixed set of values from the Engine API enum. */
	| "select"
	/** Amount + unit, serialised to nanoseconds. */
	| "duration"
	/** Amount + unit, serialised to bytes. */
	| "bytes"
	/** Fractional cores, serialised to nano CPUs. */
	| "cpu"
	/** One entry per line, serialised to `string[]`. */
	| "lines"
	/** `KEY=VALUE` per line, serialised to `Record<string, string>`. */
	| "mapLines"
	/** Repeatable structured rows, serialised to an array of objects. */
	| "rows";

export interface SelectOption {
	value: string;
	label: string;
	/** Short plain-language note shown next to the option. */
	hint: string;
}

export interface RowColumn {
	/** Dot path *inside a single row object*, e.g. `BindOptions.Propagation`. */
	key: string;
	label: string;
	type: "text" | "number" | "boolean" | "select";
	options?: Array<SelectOption>;
	placeholder?: string;
	/**
	 * Relative column width in the row grid. A hint, not a measurement — the
	 * editor maps it to a track size so a port number and a mount path do not
	 * get the same amount of room.
	 */
	width?: "sm" | "md" | "lg";
	/** Serialise the cell as an array by splitting the entered text. */
	split?: "comma";
	hint: string;
}

export interface FieldDef {
	/** Stable id used for state keys and permalinks. Never reuse or rename. */
	id: string;
	/** Dot path inside the ServiceSpec body, e.g. `TaskTemplate.Resources.Limits.MemoryBytes`. */
	path: string;
	/** The literal JSON key, shown as the field's monospace label. */
	key: string;
	type: FieldType;
	title: string;
	/** One sentence: what this key does. */
	summary: string;
	/** Longer prose: when to reach for it, and how it interacts with the rest. */
	details: Array<string>;
	options?: Array<SelectOption>;
	columns?: Array<RowColumn>;
	/**
	 * For `select` fields whose JSON shape is not the raw option value, e.g.
	 * `Mode` where picking `global` must emit `{ "Global": {} }`.
	 */
	valueMap?: Record<string, unknown>;
	/** Default unit id for `duration` / `bytes` fields. */
	defaultUnit?: string;
	/** Pre-filled value applied when the field is switched on. */
	defaultValue?: string;
	/** Switched on from the start, for fields the output is meaningless without. */
	defaultEnabled?: boolean;
	placeholder?: string;
	/** Engine API default, quoted verbatim from the swagger definition. */
	apiDefault?: string;
	/** Equivalent `docker service update` / `docker service create` flag. */
	cli?: string;
	/** Equivalent key in a Compose / stack file. */
	compose?: string;
	/** Foot-gun worth calling out before someone ships this to production. */
	caution?: string;
	/** Extra validation used to produce actionable warnings. */
	lineHint?: "kv" | "constraint" | "host";
}

export interface SectionDef {
	id: string;
	title: string;
	/** Dot path of the section root, shown as a breadcrumb above the fields. */
	path: string;
	summary: string;
	details?: Array<string>;
	/**
	 * `spec` fields become part of the request body. `request` fields are query
	 * string / header inputs of `POST /services/{id}/update` and never appear in
	 * the generated ServiceSpec.
	 */
	target?: "spec" | "request";
	fields: Array<FieldDef>;
}

/** Editable state of a single field. Kept string-based so it URL-encodes cleanly. */
export interface FieldState {
	enabled: boolean;
	value: string;
	unit?: string;
	rows?: Array<Record<string, string>>;
}

export const EMPTY_FIELD_STATE: FieldState = { enabled: false, value: "" };

export function initialFieldState(field: FieldDef): FieldState {
	return {
		enabled: field.defaultEnabled ?? false,
		value: field.defaultValue ?? "",
		unit: field.defaultUnit,
		rows: field.type === "rows" ? [] : undefined,
	};
}
