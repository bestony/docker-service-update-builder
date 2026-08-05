import { Button, Text } from "@cloudflare/kumo";
import { useSelector } from "@tanstack/react-store";
import { PRESETS } from "#/docker/presets";
import { generatorStore, presetById } from "#/store/generator-store";
import InlineText from "../InlineText";

/**
 * Presets are the fastest way to understand the shape of a real update body:
 * each one is a complete, defensible configuration rather than a single key.
 */
export default function PresetBar() {
	const presetId = useSelector(generatorStore, (state) => state.presetId);
	const active = presetId ? presetById.get(presetId) : undefined;

	return (
		<div className="panel">
			<div className="preset-bar__intro">
				<p className="kicker">Start from a preset</p>
				<Text variant="heading3" as="h2">
					Common update shapes
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
						{preset.title}
					</Button>
				))}
				<Button
					variant="secondary-destructive"
					size="sm"
					onClick={() => generatorStore.actions.reset()}
				>
					Clear all
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
					Or tick any field below. Only the fields you enable end up in the
					generated object.
				</Text>
			)}
		</div>
	);
}
