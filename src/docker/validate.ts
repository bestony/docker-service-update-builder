import type { FieldStates, JsonValue } from "./build-spec";
import { toJsonValue } from "./build-spec";
import { getField } from "./catalog";

export type IssueLevel = "error" | "warning" | "info";

export interface Issue {
	level: IssueLevel;
	/** Field ids this issue points at, used to scroll/highlight in the form. */
	fieldIds: Array<string>;
	title: string;
	detail: string;
}

function jsonValueOf(states: FieldStates, id: string): JsonValue | undefined {
	const field = getField(id);
	const state = states[id];
	if (!field || !state?.enabled) return undefined;
	return toJsonValue(field, state);
}

function rawOf(states: FieldStates, id: string): string {
	const state = states[id];
	return state?.enabled ? state.value : "";
}

function rowsOf(
	states: FieldStates,
	id: string,
): Array<Record<string, string>> {
	const state = states[id];
	if (!state?.enabled) return [];
	return state.rows ?? [];
}

function asNumber(value: JsonValue | undefined): number | undefined {
	return typeof value === "number" ? value : undefined;
}

const MIN_PROBE_NS = 1_000_000;

/**
 * Cross-field checks. These are the mistakes that produce a confusing daemon
 * error (or worse, silently degraded behaviour) rather than a clean 400, so
 * each issue explains the consequence instead of just naming the rule.
 */
export function validate(states: FieldStates): Array<Issue> {
	const issues: Array<Issue> = [];
	const push = (issue: Issue) => issues.push(issue);

	const modeKind = rawOf(states, "mode-kind");
	const replicas = asNumber(jsonValueOf(states, "replicas"));

	if (
		(modeKind === "global" || modeKind === "global-job") &&
		replicas !== undefined
	) {
		push({
			level: "error",
			fieldIds: ["mode-kind", "replicas"],
			title: "Replica count set on a global service",
			detail:
				"Mode is a tagged union — sending both Mode.Global and Mode.Replicated.Replicas produces an invalid spec. Global services always run exactly one task per eligible node.",
		});
	}

	if (
		modeKind === "replicated" &&
		(jsonValueOf(states, "job-max-concurrent") !== undefined ||
			jsonValueOf(states, "job-total-completions") !== undefined)
	) {
		push({
			level: "error",
			fieldIds: ["mode-kind", "job-max-concurrent", "job-total-completions"],
			title: "Job settings on a replicated service",
			detail:
				"MaxConcurrent and TotalCompletions live under Mode.ReplicatedJob. Switch the mode kind to 'Replicated job' or drop these fields.",
		});
	}

	const endpointMode = rawOf(states, "endpoint-mode");
	const ports = rowsOf(states, "ports");

	if (endpointMode === "dnsrr" && ports.length > 0) {
		push({
			level: "error",
			fieldIds: ["endpoint-mode", "ports"],
			title: "Published ports require vip endpoint mode",
			detail:
				"The daemon rejects a spec that publishes ports while EndpointSpec.Mode is dnsrr, because there is no virtual IP to route the ingress traffic to.",
		});
	}

	const updateOrder = rawOf(states, "updateconfig-order");
	if (
		updateOrder === "start-first" &&
		ports.some((row) => row.PublishMode === "host")
	) {
		push({
			level: "error",
			fieldIds: ["updateconfig-order", "ports"],
			title: "start-first cannot be used with host-mode ports",
			detail:
				"A start-first rollout runs the old and new task at the same time. Both would try to bind the same port on the node, so the new task fails to start and the rollout stalls.",
		});
	}

	for (const [id, label] of [
		["update-max-failure-ratio", "UpdateConfig"],
		["rollback-max-failure-ratio", "RollbackConfig"],
	] as const) {
		const raw = rawOf(states, id).trim();
		if (raw === "") continue;
		const parsed = Number(raw);
		if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
			push({
				level: "error",
				fieldIds: [id],
				title: `${label}.MaxFailureRatio must be between 0 and 1`,
				detail:
					"It is a fraction, not a percentage: 20% of tasks is 0.2. Values outside the range are rejected by the daemon.",
			});
		}
	}

	const limitMemory = asNumber(jsonValueOf(states, "limit-memory"));
	const reserveMemory = asNumber(jsonValueOf(states, "reserve-memory"));
	if (
		limitMemory !== undefined &&
		reserveMemory !== undefined &&
		reserveMemory > limitMemory
	) {
		push({
			level: "error",
			fieldIds: ["limit-memory", "reserve-memory"],
			title: "Memory reservation exceeds the limit",
			detail:
				"The scheduler would reserve more memory than the cgroup allows the task to use. Docker rejects this combination.",
		});
	}

	const limitCpu = asNumber(jsonValueOf(states, "limit-cpu"));
	const reserveCpu = asNumber(jsonValueOf(states, "reserve-cpu"));
	if (
		limitCpu !== undefined &&
		reserveCpu !== undefined &&
		reserveCpu > limitCpu
	) {
		push({
			level: "error",
			fieldIds: ["limit-cpu", "reserve-cpu"],
			title: "CPU reservation exceeds the limit",
			detail:
				"Reserving more cores than the limit permits means the task can never use what was set aside for it.",
		});
	}

	const restartCondition = rawOf(states, "restart-condition");
	const maxAttempts = asNumber(jsonValueOf(states, "restart-max-attempts"));
	if (
		restartCondition === "none" &&
		maxAttempts !== undefined &&
		maxAttempts > 0
	) {
		push({
			level: "warning",
			fieldIds: ["restart-condition", "restart-max-attempts"],
			title: "MaxAttempts has no effect with Condition: none",
			detail:
				"Tasks are never restarted, so the attempt counter is ignored. If you meant to bound retries, use Condition: on-failure.",
		});
	}

	for (const row of rowsOf(states, "mounts")) {
		if (!row.Target?.trim()) {
			push({
				level: "error",
				fieldIds: ["mounts"],
				title: "Mount without a Target",
				detail:
					"Every mount needs an absolute container path in Target, otherwise the task cannot be created.",
			});
			break;
		}
	}

	if (
		rowsOf(states, "mounts").some(
			(row) => row.Type === "tmpfs" && row.Source?.trim(),
		)
	) {
		push({
			level: "error",
			fieldIds: ["mounts"],
			title: "tmpfs mount with a Source",
			detail:
				"Source must be empty for Type=tmpfs — the filesystem is created in memory and has nothing to bind to.",
		});
	}

	if (
		rowsOf(states, "mounts").some((row) => row.Type === "bind") &&
		jsonValueOf(states, "constraints") === undefined
	) {
		push({
			level: "warning",
			fieldIds: ["mounts", "constraints"],
			title: "Bind mount without a placement constraint",
			detail:
				"A bind mount depends on a path existing on one specific node. Without a constraint pinning the service there, rescheduling will land the task on a node where the path is missing.",
		});
	}

	const constraints = jsonValueOf(states, "constraints");
	if (Array.isArray(constraints)) {
		const malformed = constraints.filter(
			(line) =>
				typeof line === "string" &&
				!line.includes("==") &&
				!line.includes("!="),
		);
		if (malformed.length > 0) {
			push({
				level: "error",
				fieldIds: ["constraints"],
				title: "Constraint expression is not a match or exclude rule",
				detail: `Constraints only support == and !=. Offending line(s): ${malformed.join(", ")}`,
			});
		}
	}

	const env = jsonValueOf(states, "env");
	if (Array.isArray(env)) {
		const malformed = env.filter(
			(line) => typeof line === "string" && !line.includes("="),
		);
		if (malformed.length > 0) {
			push({
				level: "warning",
				fieldIds: ["env"],
				title: "Environment entry without an '=' separator",
				detail: `Env is a list of VAR=value strings. Offending line(s): ${malformed.join(", ")}`,
			});
		}
	}

	for (const id of [
		"health-interval",
		"health-timeout",
		"health-start-period",
	] as const) {
		const value = asNumber(jsonValueOf(states, id));
		if (value !== undefined && value > 0 && value < MIN_PROBE_NS) {
			push({
				level: "error",
				fieldIds: [id],
				title: "Health check duration below 1 ms",
				detail:
					"The Engine API requires these to be either 0 (inherit from the image) or at least 1000000 ns.",
			});
		}
	}

	const healthTimeout = asNumber(jsonValueOf(states, "health-timeout"));
	const healthInterval = asNumber(jsonValueOf(states, "health-interval"));
	if (
		healthTimeout !== undefined &&
		healthInterval !== undefined &&
		healthTimeout >= healthInterval
	) {
		push({
			level: "warning",
			fieldIds: ["health-timeout", "health-interval"],
			title: "Health check timeout is not shorter than the interval",
			detail:
				"Probes will overlap: a new one starts before the previous has been declared failed, which multiplies load on an already struggling task.",
		});
	}

	const monitor = asNumber(jsonValueOf(states, "update-monitor"));
	const startPeriod = asNumber(jsonValueOf(states, "health-start-period"));
	if (
		monitor !== undefined &&
		startPeriod !== undefined &&
		monitor <= startPeriod
	) {
		push({
			level: "warning",
			fieldIds: ["update-monitor", "health-start-period"],
			title:
				"Rollout monitor window ends before the health check starts reporting",
			detail:
				"UpdateConfig.Monitor should outlast HealthCheck.StartPeriod plus a couple of intervals, otherwise a task is declared a successful update before its first real probe has run.",
		});
	}

	if (
		rawOf(states, "update-failure-action") === "rollback" &&
		jsonValueOf(states, "rollback-parallelism") === undefined &&
		jsonValueOf(states, "rollback-delay") === undefined &&
		jsonValueOf(states, "rollback-monitor") === undefined
	) {
		push({
			level: "info",
			fieldIds: ["update-failure-action", "rollback-parallelism"],
			title: "Automatic rollback enabled without a RollbackConfig",
			detail:
				"The daemon will fall back to its defaults (parallelism 1, no delay, stop-first). Setting RollbackConfig explicitly makes recovery faster and predictable.",
		});
	}

	if (
		jsonValueOf(states, "read-only") === true &&
		!rowsOf(states, "mounts").some((row) => row.Type === "tmpfs")
	) {
		push({
			level: "warning",
			fieldIds: ["read-only", "mounts"],
			title: "Read-only root filesystem without a tmpfs mount",
			detail:
				"Most images write to /tmp or a cache directory on startup. Add a tmpfs mount for those paths or the container will fail immediately.",
		});
	}

	for (const [id, key, label] of [
		["ulimits", "Name", "Ulimit"],
		["networks", "Target", "Network attachment"],
		["secrets", "SecretID", "Secret"],
		["configs", "ConfigID", "Config"],
	] as const) {
		if (rowsOf(states, id).some((row) => !row[key]?.trim())) {
			push({
				level: "error",
				fieldIds: [id],
				title: `${label} row is missing ${key}`,
				detail: `${key} is required for every entry; rows without it produce an invalid spec.`,
			});
		}
	}

	if (rawOf(states, "req-version").trim() === "") {
		push({
			level: "warning",
			fieldIds: ["req-version"],
			title: "No version supplied for the update request",
			detail:
				"`?version=` is a required query parameter. Read Version.Index from GET /services/{id} and send that exact value, otherwise the daemon answers 409 Conflict.",
		});
	}

	return issues;
}

export function countByLevel(issues: Array<Issue>, level: IssueLevel): number {
	return issues.filter((issue) => issue.level === level).length;
}
