import { createAtom, Store } from "@tanstack/store";
import type { FieldStates } from "#/docker/build-spec";
import { buildRequestOptions, buildServiceSpec } from "#/docker/build-spec";
import { getField } from "#/docker/catalog";
import type { Preset } from "#/docker/presets";
import { applyPreset, createInitialStates, PRESETS } from "#/docker/presets";
import { buildCurlScript } from "#/docker/request";
import { validate } from "#/docker/validate";
import { toYaml } from "#/docker/yaml";

export type OutputFormat = "json" | "yaml" | "curl";

export interface GeneratorState {
	states: FieldStates;
	format: OutputFormat;
	/** Free-text filter applied to the field catalog. */
	filter: string;
	/** Id of the preset last applied, purely for highlighting the button. */
	presetId: string | null;
}

function initialState(): GeneratorState {
	return {
		states: createInitialStates(),
		format: "json",
		filter: "",
		presetId: null,
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
		presetId: null,
		states: { ...state.states, [fieldId]: { ...current, ...patch } },
	};
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
				presetId: null,
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

	applyPreset(preset: Preset) {
		setState((state) => ({
			...state,
			presetId: preset.id,
			states: applyPreset(createInitialStates(), preset),
		}));
	},

	/** Adds a preset on top of whatever is already configured. */
	mergePreset(preset: Preset) {
		setState((state) => ({
			...state,
			presetId: null,
			states: applyPreset(state.states, preset),
		}));
	},

	reset() {
		setState((state) => ({ ...initialState(), format: state.format }));
	},

	/** Replaces the whole field map, used when opening a permalink. */
	hydrate(states: FieldStates) {
		setState((state) => ({ ...state, presetId: null, states }));
	},
}));

/**
 * Derived values. `createAtom` tracks the store reads inside the callback, so
 * these recompute only when the underlying field states actually change.
 */
export const specAtom = createAtom(() =>
	buildServiceSpec(generatorStore.get().states),
);

export const requestOptionsAtom = createAtom(() =>
	buildRequestOptions(generatorStore.get().states),
);

export const issuesAtom = createAtom(() =>
	validate(generatorStore.get().states),
);

export const outputAtom = createAtom(() => {
	const format = generatorStore.get().format;
	const spec = specAtom.get();

	switch (format) {
		case "yaml":
			return { language: "yaml", text: toYaml(spec) };
		case "curl":
			return {
				language: "bash",
				text: buildCurlScript(spec, requestOptionsAtom.get()),
			};
		default:
			return { language: "json", text: `${JSON.stringify(spec, null, 2)}\n` };
	}
});

export const presetById = new Map(PRESETS.map((preset) => [preset.id, preset]));
