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
		<div className="demo-panel flex flex-col gap-3">
			<div>
				<p className="island-kicker mb-1">Start from a preset</p>
				<h2 className="demo-section-title">Common update shapes</h2>
			</div>

			<div className="flex flex-wrap gap-2">
				{PRESETS.map((preset) => (
					<button
						key={preset.id}
						type="button"
						title={preset.summary}
						className={`demo-button px-3 py-2 text-xs ${
							presetId === preset.id ? "" : "demo-button-secondary"
						}`}
						onClick={() => generatorStore.actions.applyPreset(preset)}
					>
						{preset.title}
					</button>
				))}
				<button
					type="button"
					className="demo-button demo-button-danger px-3 py-2 text-xs"
					onClick={() => generatorStore.actions.reset()}
				>
					Clear all
				</button>
			</div>

			{active ? (
				<div className="demo-list-item flex flex-col gap-1">
					<strong className="text-sm text-[var(--sea-ink)]">
						{active.summary}
					</strong>
					<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
						<InlineText text={active.rationale} />
					</p>
				</div>
			) : (
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
					Or tick any field below. Only the fields you enable end up in the
					generated object.
				</p>
			)}
		</div>
	);
}
