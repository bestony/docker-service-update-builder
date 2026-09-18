import { Button, Text } from "@cloudflare/kumo";
import { useSelector } from "@tanstack/react-store";
import { PRESETS } from "#/docker/presets";
import { useLocale, useT } from "#/i18n/locale-context";
import { presetCopy } from "#/i18n/presets";
import { generatorStore } from "#/store/generator-store";
import InlineText from "../InlineText";

/**
 * Presets are the fastest way to understand the shape of a real update body:
 * each one is a complete, defensible configuration rather than a single key.
 *
 * The preset data carries only an id and its field values; the prose lives in
 * the message dictionary and is reached through `presetCopy(id, locale)`, so the
 * ids — the only part that reaches the store — never move between languages.
 *
 * Presets toggle: several can be on at once, and the panel below lists every
 * active one so their rationales can be read together.
 */
export default function PresetBar() {
	const t = useT();
	const { locale } = useLocale();
	const presetIds = useSelector(generatorStore, (state) => state.presetIds);
	const activePresets = PRESETS.filter((preset) =>
		presetIds.includes(preset.id),
	);

	return (
		<div className="panel">
			<div className="preset-bar__intro">
				<p className="kicker">{t("presets.kicker")}</p>
				<Text variant="heading3" as="h2">
					{t("presets.heading")}
				</Text>
			</div>

			<div className="preset-bar__options">
				{PRESETS.map((preset) => {
					const active = presetIds.includes(preset.id);
					const copy = presetCopy(preset.id, locale);

					return (
						<Button
							key={preset.id}
							size="sm"
							variant={active ? "primary" : "secondary"}
							aria-pressed={active}
							title={copy?.summary}
							onClick={() => generatorStore.actions.togglePreset(preset)}
						>
							{copy?.title ?? preset.id}
						</Button>
					);
				})}
				<Button
					variant="secondary-destructive"
					size="sm"
					onClick={() => generatorStore.actions.reset()}
				>
					{t("presets.clearAll")}
				</Button>
			</div>

			{activePresets.length > 0 ? (
				<div className="preset-bar__details">
					{activePresets.map((preset) => {
						const copy = presetCopy(preset.id, locale);

						return (
							<div key={preset.id} className="preset-bar__detail">
								<Text as="strong" size="sm" bold>
									{copy?.title ?? preset.id}
								</Text>
								<Text variant="secondary" size="sm">
									<InlineText text={copy?.summary ?? ""} />
								</Text>
								<Text variant="secondary" size="sm">
									<InlineText text={copy?.rationale ?? ""} />
								</Text>
							</div>
						);
					})}
				</div>
			) : (
				<Text variant="secondary" size="sm">
					{t("presets.empty")}
				</Text>
			)}
		</div>
	);
}
