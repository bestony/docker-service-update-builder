import type { FieldStates } from "./build-spec";
import { ALL_FIELDS } from "./catalog";
import type { FieldState } from "./field-types";
import { initialFieldState } from "./field-types";

export function createInitialStates(): FieldStates {
	const states: FieldStates = {};
	for (const field of ALL_FIELDS) {
		states[field.id] = initialFieldState(field);
	}
	return states;
}

type PresetValue = Partial<Omit<FieldState, "enabled">>;

/**
 * A preset is its id and its field values — nothing else.
 *
 * The title, summary and rationale are prose, so they live in the message
 * dictionary under `presets.items.<id>` (`src/i18n/presets.ts` maps the id to
 * the dictionary segment). Keeping them out of here means the `values` table
 * stays a pure data structure and the ids, which are the only part that reaches
 * the store, never move.
 */
export interface Preset {
	id: string;
	values: Record<string, PresetValue>;
}

export const PRESETS: Array<Preset> = [
	{
		id: "memory-limit",
		values: {
			"limit-memory": { value: "12", unit: "GiB" },
		},
	},
	{
		id: "zero-downtime",
		values: {
			"update-parallelism": { value: "1" },
			"update-delay": { value: "10", unit: "s" },
			"update-monitor": { value: "60", unit: "s" },
			"update-failure-action": { value: "rollback" },
			"update-max-failure-ratio": { value: "0" },
			"updateconfig-order": { value: "start-first" },
			"rollback-parallelism": { value: "2" },
			"rollback-delay": { value: "5", unit: "s" },
			"rollback-monitor": { value: "20", unit: "s" },
			"rollbackconfig-order": { value: "start-first" },
			"health-test": {
				value: "CMD-SHELL\ncurl -fsS http://localhost:8080/healthz || exit 1",
			},
			"health-interval": { value: "10", unit: "s" },
			"health-timeout": { value: "3", unit: "s" },
			"health-retries": { value: "3" },
			"health-start-period": { value: "30", unit: "s" },
			"stop-grace-period": { value: "30", unit: "s" },
		},
	},
	{
		id: "scale",
		values: {
			"mode-kind": { value: "replicated" },
			replicas: { value: "5" },
		},
	},
	{
		id: "force-redeploy",
		values: {
			"force-update": { value: "1" },
		},
	},
	{
		id: "hardened",
		values: {
			"read-only": { value: "true" },
			init: { value: "true" },
			user: { value: "10001:10001" },
			"cap-drop": { value: "CAP_ALL" },
			"cap-add": { value: "CAP_NET_BIND_SERVICE" },
			mounts: {
				rows: [
					{
						Type: "tmpfs",
						Target: "/tmp",
						"TmpfsOptions.SizeBytes": "67108864",
					},
				],
			},
			"limit-pids": { value: "512" },
		},
	},
	{
		id: "manual-rollback",
		values: {
			"req-rollback": { value: "previous" },
			"req-registry-auth-from": { value: "previous-spec" },
		},
	},
];

export function applyPreset(base: FieldStates, preset: Preset): FieldStates {
	const next: FieldStates = { ...base };

	for (const [fieldId, patch] of Object.entries(preset.values)) {
		const current = next[fieldId];
		if (!current) continue;
		next[fieldId] = {
			...current,
			...patch,
			enabled: true,
		};
	}

	return next;
}

export function applyPresets(
	base: FieldStates,
	presets: Array<Preset>,
): FieldStates {
	let next = base;
	for (const preset of presets) {
		next = applyPreset(next, preset);
	}
	return next;
}
