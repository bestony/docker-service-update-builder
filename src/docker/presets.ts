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

export interface Preset {
	id: string;
	title: string;
	summary: string;
	/** Why an operator would reach for this shape, in one paragraph. */
	rationale: string;
	values: Record<string, PresetValue>;
}

export const PRESETS: Array<Preset> = [
	{
		id: "memory-limit",
		title: "Raise the memory limit",
		summary:
			"The minimal one-key body: TaskTemplate.Resources.Limits.MemoryBytes.",
		rationale:
			"The smallest useful update body there is. It is also the clearest illustration of why partial specs are dangerous: sent on its own it would erase the image, the environment and every mount, so this object has to be merged into the spec you read back from GET /services/{id}.",
		values: {
			"limit-memory": { value: "12", unit: "GiB" },
		},
	},
	{
		id: "zero-downtime",
		title: "Zero-downtime rollout",
		summary:
			"start-first ordering, a real health check, and automatic rollback when the new version misbehaves.",
		rationale:
			"The combination that makes a deploy invisible to users: one task at a time, the replacement starts before the old one stops, each new task is watched for long enough that a crash-loop is caught, and a failure reverts the service instead of leaving it half-updated.",
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
		title: "Scale replicas",
		summary: "Change Mode.Replicated.Replicas and nothing else.",
		rationale:
			"Scaling is the cheapest update Swarm knows: the task template is untouched, so no image is pulled and no running task is replaced — Swarm simply starts or stops replicas.",
		values: {
			"mode-kind": { value: "replicated" },
			replicas: { value: "5" },
		},
	},
	{
		id: "force-redeploy",
		title: "Force a redeploy",
		summary: "Bump TaskTemplate.ForceUpdate to re-pull a mutable tag.",
		rationale:
			"Swarm only acts when the spec changes. After re-pushing the same tag nothing differs, so the rollout never happens. Incrementing this counter creates a spec difference and the normal UpdateConfig rollout runs.",
		values: {
			"force-update": { value: "1" },
		},
	},
	{
		id: "hardened",
		title: "Hardened container",
		summary:
			"Read-only root, all capabilities dropped, an init process and a non-root user.",
		rationale:
			"The default posture a security review asks for. The tmpfs mount is not optional — a read-only root filesystem breaks almost every image that writes to /tmp during startup.",
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
		title: "Manual rollback",
		summary:
			"Call the endpoint with ?rollback=previous and let the body be ignored.",
		rationale:
			"The escape hatch when a deploy went out and nobody configured automatic rollback. The daemon restores PreviousSpec; the body is still required by the endpoint but its contents are discarded — which is why the generated JSON here is intentionally almost empty.",
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
