import { Button, Text } from "@cloudflare/kumo";
import { useSelector } from "@tanstack/react-store";
import { localizePresetCopy } from "#/docker/catalog-copy";
import { PRESETS } from "#/docker/presets";
import { type MessageKey, useI18n } from "#/i18n";
import { generatorStore } from "#/store/generator-store";
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
	const { locale, t } = useI18n();
	const presetIds = useSelector(generatorStore, (state) => state.presetIds);
	const activePresets = PRESETS.filter((preset) =>
		presetIds.includes(preset.id),
	);

	return (
		<div className="panel">
			<div className="preset-bar__intro">
				<p className="kicker">{t("preset.kicker")}</p>
				<Text variant="heading3" as="h2">
					{t("preset.title")}
				</Text>
			</div>

			<div className="preset-bar__options">
				{PRESETS.map((preset) => {
					const active = presetIds.includes(preset.id);
					const copy = localizePresetCopy(locale, preset);

					return (
						<Button
							key={preset.id}
							size="sm"
							variant={active ? "primary" : "secondary"}
							aria-pressed={active}
							title={copy.summary ?? preset.summary}
							onClick={() => generatorStore.actions.togglePreset(preset)}
						>
							{PRESET_TITLE_KEYS[preset.id]
								? t(PRESET_TITLE_KEYS[preset.id])
								: preset.title}
						</Button>
					);
				})}
				<Button
					variant="secondary-destructive"
					size="sm"
					onClick={() => generatorStore.actions.reset()}
				>
					{t("preset.clear")}
				</Button>
			</div>

			{activePresets.length > 0 ? (
				<div className="preset-bar__details">
					{activePresets.map((preset) => {
						const copy = localizePresetCopy(locale, preset);

						return (
							<div key={preset.id} className="preset-bar__detail">
								<Text as="strong" size="sm" bold>
									{PRESET_TITLE_KEYS[preset.id]
										? t(PRESET_TITLE_KEYS[preset.id])
										: preset.title}
								</Text>
								<Text variant="secondary" size="sm">
									<InlineText text={copy.summary ?? preset.summary} />
								</Text>
								<Text variant="secondary" size="sm">
									<InlineText text={copy.rationale ?? preset.rationale} />
								</Text>
							</div>
						);
					})}
				</div>
			) : (
				<Text variant="secondary" size="sm">
					{t("preset.orTick")}
				</Text>
			)}
		</div>
	);
}
