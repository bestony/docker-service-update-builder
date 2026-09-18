import type { MessageKey, Translate } from "../i18n/translate";

/**
 * Unit helpers for the Docker Engine API.
 *
 * The Engine API only speaks raw scalars: durations are nanoseconds, memory is
 * bytes and CPU is "nano CPUs" (one core === 1_000_000_000). Humans think in
 * seconds, gibibytes and fractional cores, so every numeric field in the
 * generator is edited in a friendly unit and serialised back to the raw scalar
 * the API expects.
 *
 * Nothing here depends on a locale beyond the `t` function passed in: the unit
 * *symbols* (`ns`, `GiB`) are the Engine's own vocabulary and stay put in every
 * language, and only the spelled-out units are translated.
 */

export interface UnitOption {
	id: string;
	label: string;
	/** Multiplier applied to the entered amount to reach the API scalar. */
	factor: number;
}

const NS_PER_MS = 1_000_000;
const NS_PER_S = 1_000 * NS_PER_MS;

export const DURATION_UNITS: Array<UnitOption> = [
	{ id: "ns", label: "ns", factor: 1 },
	{ id: "ms", label: "ms", factor: NS_PER_MS },
	{ id: "s", label: "seconds", factor: NS_PER_S },
	{ id: "m", label: "minutes", factor: 60 * NS_PER_S },
	{ id: "h", label: "hours", factor: 3600 * NS_PER_S },
];

const KIB = 1024;

export const BYTE_UNITS: Array<UnitOption> = [
	{ id: "B", label: "bytes", factor: 1 },
	{ id: "KiB", label: "KiB", factor: KIB },
	{ id: "MiB", label: "MiB", factor: KIB ** 2 },
	{ id: "GiB", label: "GiB", factor: KIB ** 3 },
	{ id: "TiB", label: "TiB", factor: KIB ** 4 },
];

export const NANO_CPUS_PER_CORE = 1_000_000_000;

/**
 * The four unit ids whose label is a word rather than a symbol. `ns`, `ms`,
 * `KiB` and friends are units of measurement, not English, so they are never
 * translated.
 */
const SPOKEN_UNIT: Record<string, MessageKey> = {
	s: "units.seconds",
	m: "units.minutes",
	h: "units.hours",
	B: "units.bytes",
};

export function unitLabel(unit: UnitOption, t: Translate): string {
	const key = SPOKEN_UNIT[unit.id];
	return key ? t(key) : unit.label;
}

export function findUnit(
	units: Array<UnitOption>,
	id: string | undefined,
): UnitOption {
	return units.find((unit) => unit.id === id) ?? units[0];
}

/** Renders a byte count the way `docker service inspect` output reads. */
export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes)) return String(bytes);
	if (bytes === 0) return "0 B";
	const negative = bytes < 0;
	const abs = Math.abs(bytes);
	let unit = BYTE_UNITS[0];
	for (const candidate of BYTE_UNITS) {
		if (abs >= candidate.factor) unit = candidate;
	}
	const amount = abs / unit.factor;
	const rendered = Number.isInteger(amount)
		? String(amount)
		: amount.toFixed(2);
	return `${negative ? "-" : ""}${rendered} ${unit.id}`;
}

/** Renders a nanosecond duration as the largest unit that stays exact-ish. */
export function formatDurationNs(nanoseconds: number, t: Translate): string {
	if (!Number.isFinite(nanoseconds)) return String(nanoseconds);
	// Zero is meaningful rather than absent: for every duration field the API
	// reads it as "use the image's value", which is worth spelling out.
	if (nanoseconds === 0) return t("units.inherit");
	const negative = nanoseconds < 0;
	const abs = Math.abs(nanoseconds);
	let unit = DURATION_UNITS[0];
	for (const candidate of DURATION_UNITS) {
		if (abs >= candidate.factor) unit = candidate;
	}
	const amount = abs / unit.factor;
	const rendered = Number.isInteger(amount)
		? String(amount)
		: amount.toFixed(3);
	return `${negative ? "-" : ""}${rendered}${unit.id === "s" ? "s" : ` ${unit.id}`}`;
}

/** Renders nano CPUs as cores, which is what the CLI flags accept. */
export function formatNanoCpus(nanoCpus: number, t: Translate): string {
	if (!Number.isFinite(nanoCpus)) return String(nanoCpus);
	const cores = nanoCpus / NANO_CPUS_PER_CORE;
	const rendered = Number.isInteger(cores) ? String(cores) : cores.toFixed(3);
	return t(cores === 1 ? "units.coresOne" : "units.coresOther", {
		count: rendered,
	});
}

/**
 * Parses a user supplied amount. Returns `undefined` for blank or unparsable
 * input so callers can simply omit the key instead of emitting `NaN`.
 */
export function parseAmount(raw: string): number | undefined {
	const trimmed = raw.trim();
	if (trimmed === "") return undefined;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : undefined;
}
