import type { FieldDef, RowColumn, SectionDef } from "../docker/field-types";

/**
 * The translatable subset of a `FieldDef` / `SectionDef`.
 *
 * Everything that is code rather than prose — `id`, `path`, `key`, `cli`,
 * `compose`, placeholder values, select option values, `valueMap`, units — is
 * absent on purpose: those are the product's identity and translating them
 * would only break the search filter and the curl output.
 *
 * Parallel tables are keyed by field id. Completeness — every catalog field has
 * a Chinese entry, and the positional arrays (`details`, `options`, `columns`)
 * are the same length on both sides — is enforced by `scripts/check-i18n.ts`,
 * which runs as part of `pnpm verify`. A mapped type over the catalog could
 * catch a missing *key* at compile time, but not a dropped paragraph, and it
 * would require every catalog file to switch to a const assertion for that one
 * key check. The runtime check is the smaller thing that covers more.
 */

export interface SelectOptionCopy {
	label: string;
	hint: string;
}

export interface RowColumnCopy {
	label: string;
	hint: string;
	/** Positional, for enum columns whose hints are prose. */
	options?: Array<SelectOptionCopy>;
}

export interface FieldCopy {
	title: string;
	summary: string;
	/** One entry per English paragraph, in the same order. */
	details: Array<string>;
	/** Omit to keep the English placeholder, which is usually a literal value. */
	placeholder?: string;
	/** Omit only when the Engine default has no words in it (e.g. `1`). */
	apiDefault?: string;
	caution?: string;
	/** Positional: entry `i` overrides the label and hint of English option `i`. */
	options?: Array<SelectOptionCopy>;
	/** Positional, like `options`. */
	columns?: Array<RowColumnCopy>;
}

export interface SectionCopy {
	title: string;
	summary: string;
	details: Array<string>;
}

function copyOptions(
	options: Array<{ value: string; label: string; hint: string }>,
	copies: Array<SelectOptionCopy>,
): Array<{ value: string; label: string; hint: string }> {
	return options.map((option, index) => ({
		...option,
		label: copies[index]?.label ?? option.label,
		hint: copies[index]?.hint ?? option.hint,
	}));
}

function copyColumns(
	columns: Array<RowColumn>,
	copies: Array<RowColumnCopy>,
): Array<RowColumn> {
	return columns.map((column, index) => {
		const copy = copies[index];
		return {
			...column,
			label: copy?.label ?? column.label,
			hint: copy?.hint ?? column.hint,
			options:
				column.options && copy?.options
					? copyOptions(column.options, copy.options)
					: column.options,
		};
	});
}

/** Returns a new `FieldDef` with the translated prose layered over the English. */
export function applyFieldCopy(field: FieldDef, copy: FieldCopy): FieldDef {
	return {
		...field,
		title: copy.title,
		summary: copy.summary,
		details: copy.details,
		placeholder: copy.placeholder ?? field.placeholder,
		apiDefault: copy.apiDefault ?? field.apiDefault,
		caution: copy.caution ?? field.caution,
		options:
			field.options && copy.options
				? copyOptions(field.options, copy.options)
				: field.options,
		columns:
			field.columns && copy.columns
				? copyColumns(field.columns, copy.columns)
				: field.columns,
	};
}

export function applySectionCopy(
	section: SectionDef,
	copy: SectionCopy,
): SectionDef {
	return {
		...section,
		title: copy.title,
		summary: copy.summary,
		details: copy.details,
	};
}

/**
 * One parallel table per catalog file, keyed by field id. The index signature is
 * deliberately open: a stale key left behind by a catalog rename should be a
 * `check-i18n` failure with a useful message, not a compile error buried in the
 * translation file.
 */
export type FieldCopyTable = Record<string, FieldCopy>;
