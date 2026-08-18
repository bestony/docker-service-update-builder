import { Button, Text } from "@cloudflare/kumo";
import { useSelector } from "@tanstack/react-store";
import { PRESETS } from "#/docker/presets";
import { type MessageKey, useI18n } from "#/i18n";
import { generatorStore, presetById } from "#/store/generator-store";
import InlineText from "../InlineText";

const PRESET_TITLE_KEYS: Record<string, MessageKey> = {
	"memory-limit": "preset.memory-limit",
	"zero-downtime": "preset.zero-downtime",
	scale: "preset.scale",
	"force-redeploy": "preset.force-redeploy",
	hardened: "preset.hardened",
	"manual-rollback": "preset.manual-rollback",
} as const;

/**
 * Presets are the fastest way to understand the shape of a real update body:
 * each one is a complete, defensible configuration rather than a single key.
 */
export default function PresetBar() {
	const { t } = useI18n();
	const presetId = useSelector(generatorStore, (state) => state.presetId);
	const active = presetId ? presetById.get(presetId) : undefined;

	return (
		<div className="panel">
			<div className="preset-bar__intro">
				<p className="kicker">{t("preset.kicker")}</p>
				<Text variant="heading3" as="h2">
					{t("preset.title")}
				</Text>
			</div>

			<div className="preset-bar__options">
				{PRESETS.map((preset) => (
					<Button
						key={preset.id}
						size="sm"
						variant={presetId === preset.id ? "primary" : "secondary"}
						title={preset.summary}
						onClick={() => generatorStore.actions.applyPreset(preset)}
					>
						{PRESET_TITLE_KEYS[preset.id]
							? t(PRESET_TITLE_KEYS[preset.id])
							: preset.title}
					</Button>
				))}
				<Button
					variant="secondary-destructive"
					size="sm"
					onClick={() => generatorStore.actions.reset()}
				>
					{t("preset.clear")}
				</Button>
			</div>

			{active ? (
				<div className="preset-bar__detail">
					<Text as="strong" size="sm" bold>
						{active.summary}
					</Text>
					<Text variant="secondary" size="sm">
						<InlineText text={active.rationale} />
					</Text>
				</div>
			) : (
				<Text variant="secondary" size="sm">
					{t("preset.orTick")}
				</Text>
			)}
		</div>
	);
}
