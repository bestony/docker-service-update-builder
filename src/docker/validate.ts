import type { MessageKey, Translate } from "../i18n/translate";
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
 *
 * Only the wording is localized. Every `title` and `detail` is looked up from
 * the `issues.*` section of the message dictionary through a shared key, so
 * there is exactly one table to keep complete rather than a parallel pair that
 * can drift apart. Field ids, levels and the checks themselves are identical in
 * every language — a locale can never change *what* is flagged.
 */
export function validate(states: FieldStates, t: Translate): Array<Issue> {
	const issues: Array<Issue> = [];

	const push = (
		level: IssueLevel,
		fieldIds: Array<string>,
		key: string,
		vars?: Record<string, string | number>,
	) => {
		issues.push({
			level,
			fieldIds,
			title: t(`${key}.title` as MessageKey, vars),
			detail: t(`${key}.detail` as MessageKey, vars),
		});
	};

	const modeKind = rawOf(states, "mode-kind");
	const replicas = asNumber(jsonValueOf(states, "replicas"));

	if (
		(modeKind === "global" || modeKind === "global-job") &&
		replicas !== undefined
	) {
		push("error", ["mode-kind", "replicas"], "issues.replicasOnGlobal");
	}

	if (
		modeKind === "replicated" &&
		(jsonValueOf(states, "job-max-concurrent") !== undefined ||
			jsonValueOf(states, "job-total-completions") !== undefined)
	) {
		push(
			"error",
			["mode-kind", "job-max-concurrent", "job-total-completions"],
			"issues.jobOnReplicated",
		);
	}

	const endpointMode = rawOf(states, "endpoint-mode");
	const ports = rowsOf(states, "ports");

	if (endpointMode === "dnsrr" && ports.length > 0) {
		push("error", ["endpoint-mode", "ports"], "issues.portsRequireVip");
	}

	const updateOrder = rawOf(states, "updateconfig-order");
	if (
		updateOrder === "start-first" &&
		ports.some((row) => row.PublishMode === "host")
	) {
		push(
			"error",
			["updateconfig-order", "ports"],
			"issues.startFirstHostPorts",
		);
	}

	for (const [id, label] of [
		["update-max-failure-ratio", "UpdateConfig"],
		["rollback-max-failure-ratio", "RollbackConfig"],
	] as const) {
		const raw = rawOf(states, id).trim();
		if (raw === "") continue;
		const parsed = Number(raw);
		if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
			push("error", [id], "issues.maxFailureRatioRange", { scope: label });
		}
	}

	const limitMemory = asNumber(jsonValueOf(states, "limit-memory"));
	const reserveMemory = asNumber(jsonValueOf(states, "reserve-memory"));
	if (
		limitMemory !== undefined &&
		reserveMemory !== undefined &&
		reserveMemory > limitMemory
	) {
		push(
			"error",
			["limit-memory", "reserve-memory"],
			"issues.memoryReservationAboveLimit",
		);
	}

	const limitCpu = asNumber(jsonValueOf(states, "limit-cpu"));
	const reserveCpu = asNumber(jsonValueOf(states, "reserve-cpu"));
	if (
		limitCpu !== undefined &&
		reserveCpu !== undefined &&
		reserveCpu > limitCpu
	) {
		push(
			"error",
			["limit-cpu", "reserve-cpu"],
			"issues.cpuReservationAboveLimit",
		);
	}

	const restartCondition = rawOf(states, "restart-condition");
	const maxAttempts = asNumber(jsonValueOf(states, "restart-max-attempts"));
	if (
		restartCondition === "none" &&
		maxAttempts !== undefined &&
		maxAttempts > 0
	) {
		push(
			"warning",
			["restart-condition", "restart-max-attempts"],
			"issues.maxAttemptsWithConditionNone",
		);
	}

	for (const row of rowsOf(states, "mounts")) {
		if (!row.Target?.trim()) {
			push("error", ["mounts"], "issues.mountWithoutTarget");
			break;
		}
	}

	if (
		rowsOf(states, "mounts").some(
			(row) => row.Type === "tmpfs" && row.Source?.trim(),
		)
	) {
		push("error", ["mounts"], "issues.tmpfsWithSource");
	}

	if (
		rowsOf(states, "mounts").some((row) => row.Type === "bind") &&
		jsonValueOf(states, "constraints") === undefined
	) {
		push("warning", ["mounts", "constraints"], "issues.bindWithoutConstraint");
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
			push("error", ["constraints"], "issues.malformedConstraint", {
				lines: malformed.join(", "),
			});
		}
	}

	const env = jsonValueOf(states, "env");
	if (Array.isArray(env)) {
		const malformed = env.filter(
			(line) => typeof line === "string" && !line.includes("="),
		);
		if (malformed.length > 0) {
			push("warning", ["env"], "issues.malformedEnv", {
				lines: malformed.join(", "),
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
			push("error", [id], "issues.healthBelowOneMs");
		}
	}

	const healthTimeout = asNumber(jsonValueOf(states, "health-timeout"));
	const healthInterval = asNumber(jsonValueOf(states, "health-interval"));
	if (
		healthTimeout !== undefined &&
		healthInterval !== undefined &&
		healthTimeout >= healthInterval
	) {
		push(
			"warning",
			["health-timeout", "health-interval"],
			"issues.healthTimeoutNotShorter",
		);
	}

	const monitor = asNumber(jsonValueOf(states, "update-monitor"));
	const startPeriod = asNumber(jsonValueOf(states, "health-start-period"));
	if (
		monitor !== undefined &&
		startPeriod !== undefined &&
		monitor <= startPeriod
	) {
		push(
			"warning",
			["update-monitor", "health-start-period"],
			"issues.monitorBeforeStartPeriod",
		);
	}

	if (
		rawOf(states, "update-failure-action") === "rollback" &&
		jsonValueOf(states, "rollback-parallelism") === undefined &&
		jsonValueOf(states, "rollback-delay") === undefined &&
		jsonValueOf(states, "rollback-monitor") === undefined
	) {
		push(
			"info",
			["update-failure-action", "rollback-parallelism"],
			"issues.rollbackWithoutConfig",
		);
	}

	if (
		jsonValueOf(states, "read-only") === true &&
		!rowsOf(states, "mounts").some((row) => row.Type === "tmpfs")
	) {
		push("warning", ["read-only", "mounts"], "issues.readOnlyWithoutTmpfs");
	}

	// The row's `key` is a JSON field name and stays English; only its label —
	// the human name for the row kind — is translated.
	for (const [id, key, label] of [
		["ulimits", "Name", t("issues.rowLabels.ulimit")],
		["networks", "Target", t("issues.rowLabels.network")],
		["secrets", "SecretID", t("issues.rowLabels.secret")],
		["configs", "ConfigID", t("issues.rowLabels.config")],
	] as const) {
		if (rowsOf(states, id).some((row) => !row[key]?.trim())) {
			push("error", [id], "issues.rowMissingKey", { label, key });
		}
	}

	if (rawOf(states, "req-version").trim() === "") {
		push("warning", ["req-version"], "issues.missingVersion");
	}

	return issues;
}
