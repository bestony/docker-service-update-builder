import { createAtom, Store } from "@tanstack/store";
import type { FieldStates } from "#/docker/build-spec";
import { buildRequestOptions, buildServiceSpec } from "#/docker/build-spec";
import { getField } from "#/docker/catalog";
import type { Preset } from "#/docker/presets";
import { applyPresets, createInitialStates, PRESETS } from "#/docker/presets";
import { buildCurlScript } from "#/docker/request";
import { validate } from "#/docker/validate";
import { toYaml } from "#/docker/yaml";
import type { Locale } from "#/i18n/locale";
import { translator } from "#/i18n/messages";

export type OutputFormat = "json" | "yaml" | "curl";

export interface GeneratorState {
	states: FieldStates;
	format: OutputFormat;
	/** Free-text filter applied to the field catalog. */
	filter: string;
	/** Pinned preset ids, purely for highlighting the buttons. */
	presetIds: Array<string>;
}

function initialState(): GeneratorState {
	return {
		states: createInitialStates(),
		format: "json",
		filter: "",
		presetIds: [],
	};
}

function patchField(
	state: GeneratorState,
	fieldId: string,
	patch: Partial<GeneratorState["states"][string]>,
): GeneratorState {
	const current = state.states[fieldId];
	if (!current) return state;

	return {
		...state,
		presetIds: [],
		states: { ...state.states, [fieldId]: { ...current, ...patch } },
	};
}

function togglePresetIds(
	current: Array<string>,
	presetId: string,
): Array<string> {
	const selected = new Set(current);
	if (selected.has(presetId)) {
		selected.delete(presetId);
	} else {
		selected.add(presetId);
	}
	return PRESETS.filter((entry) => selected.has(entry.id)).map(
		(entry) => entry.id,
	);
}

/**
 * Single source of truth for the builder.
 *
 * Every mutation goes through a named action so the reducer logic stays out of
 * the components — and so the TanStack Store devtools panel shows an
 * intelligible action trail instead of anonymous `setState` calls.
 */
export const generatorStore = new Store(initialState(), ({ setState }) => ({
	toggleField(fieldId: string, enabled: boolean) {
		setState((state) => {
			const field = getField(fieldId);
			const current = state.states[fieldId];
			if (!field || !current) return state;

			// Switching a field on with nothing in it is a dead end for selects and
			// booleans, so seed them with something meaningful.
			let value = current.value;
			if (enabled && value === "") {
				if (field.type === "boolean") value = "true";
				else if (field.type === "select")
					value = field.defaultValue ?? field.options?.[0]?.value ?? "";
				else value = field.defaultValue ?? "";
			}

			const rows =
				enabled && field.type === "rows" && (current.rows?.length ?? 0) === 0
					? [{}]
					: current.rows;

			return {
				...state,
				presetIds: [],
				states: {
					...state.states,
					[fieldId]: { ...current, enabled, value, rows },
				},
			};
		});
	},

	setValue(fieldId: string, value: string) {
		setState((state) => patchField(state, fieldId, { value, enabled: true }));
	},

	setUnit(fieldId: string, unit: string) {
		setState((state) => patchField(state, fieldId, { unit }));
	},

	addRow(fieldId: string) {
		setState((state) => {
			const current = state.states[fieldId];
			if (!current) return state;
			return patchField(state, fieldId, {
				enabled: true,
				rows: [...(current.rows ?? []), {}],
			});
		});
	},

	removeRow(fieldId: string, index: number) {
		setState((state) => {
			const current = state.states[fieldId];
			if (!current) return state;
			return patchField(state, fieldId, {
				rows: (current.rows ?? []).filter((_, position) => position !== index),
			});
		});
	},

	setCell(fieldId: string, index: number, key: string, value: string) {
		setState((state) => {
			const current = state.states[fieldId];
			if (!current) return state;
			const rows = (current.rows ?? []).map((row, position) =>
				position === index ? { ...row, [key]: value } : row,
			);
			return patchField(state, fieldId, { enabled: true, rows });
		});
	},

	setFormat(format: OutputFormat) {
		setState((state) => ({ ...state, format }));
	},

	setFilter(filter: string) {
		setState((state) => ({ ...state, filter }));
	},

	togglePreset(preset: Preset) {
		setState((state) => {
			const presetIds = togglePresetIds(state.presetIds, preset.id);
			return {
				...state,
				presetIds,
				states: applyPresets(
					createInitialStates(),
					PRESETS.filter((entry) => presetIds.includes(entry.id)),
				),
			};
		});
	},

	reset() {
		setState((state) => ({ ...initialState(), format: state.format }));
	},

	/** Replaces the whole field map, used when opening a permalink. */
	hydrate(states: FieldStates) {
		setState((state) => ({ ...state, presetIds: [], states }));
	},
}));

/**
 * Derived values. `createAtom` tracks the store reads inside the callback, so
 * these recompute only when the underlying field states actually change.
 *
 * The JSON and YAML outputs are language-independent, so those atoms exist
 * once. The two that contain prose — the review findings and the curl comments
 * — are built per locale, because rebuilding them on every render would make
 * their identity churn and drag the whole output panel along with it.
 */
export const specAtom = createAtom(() =>
	buildServiceSpec(generatorStore.get().states),
);

export const requestOptionsAtom = createAtom(() =>
	buildRequestOptions(generatorStore.get().states),
);

const ISSUES_ATOMS = new Map<Locale, ReturnType<typeof createIssuesAtom>>();

function createIssuesAtom(locale: Locale) {
	const t = translator(locale);
	return createAtom(() => validate(generatorStore.get().states, t));
}

export function issuesAtomFor(locale: Locale) {
	const cached = ISSUES_ATOMS.get(locale);
	if (cached) return cached;
	const atom = createIssuesAtom(locale);
	ISSUES_ATOMS.set(locale, atom);
	return atom;
}

const OUTPUT_ATOMS = new Map<Locale, ReturnType<typeof createOutputAtom>>();

function createOutputAtom(locale: Locale) {
	const t = translator(locale);
	return createAtom(() => {
		const format = generatorStore.get().format;
		const spec = specAtom.get();

		switch (format) {
			case "yaml":
				return { language: "yaml", text: toYaml(spec) };
			case "curl":
				return {
					language: "bash",
					text: buildCurlScript(spec, requestOptionsAtom.get(), t),
				};
			default:
				return {
					language: "json",
					text: `${JSON.stringify(spec, null, 2)}\n`,
				};
		}
	});
}

export function outputAtomFor(locale: Locale) {
	const cached = OUTPUT_ATOMS.get(locale);
	if (cached) return cached;
	const atom = createOutputAtom(locale);
	OUTPUT_ATOMS.set(locale, atom);
	return atom;
}

export const presetById = new Map(PRESETS.map((preset) => [preset.id, preset]));
