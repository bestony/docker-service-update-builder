import type { Locale } from "./locale";
import type { MessageKey } from "./messages";
import { translator } from "./messages";

/**
 * Which message segment describes each preset. The preset `id` is a wire value
 * — it lands in the store and in the permalink — so it must not change; this
 * table is the indirection between it and the copy.
 */
const PRESET_SEGMENT = {
	"memory-limit": "memoryLimit",
	"zero-downtime": "zeroDowntime",
	scale: "scale",
	"force-redeploy": "forceRedeploy",
	hardened: "hardened",
	"manual-rollback": "manualRollback",
} as const;

export type PresetId = keyof typeof PRESET_SEGMENT;

/** Presets are identified by these ids; the copy lives in the dictionary. */
export const PRESET_IDS = Object.keys(PRESET_SEGMENT) as Array<PresetId>;

export interface LocalizedPresetCopy {
	title: string;
	summary: string;
	rationale: string;
}

export function presetCopy(
	id: string,
	locale: Locale,
): LocalizedPresetCopy | undefined {
	const segment = PRESET_SEGMENT[id as PresetId];
	if (!segment) return undefined;

	const t = translator(locale);
	const key = (part: MessageKey) => t(part);

	return {
		title: key(`presets.items.${segment}.title` as MessageKey),
		summary: key(`presets.items.${segment}.summary` as MessageKey),
		rationale: key(`presets.items.${segment}.rationale` as MessageKey),
	};
}
