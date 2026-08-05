import { useSelector } from "@tanstack/react-store";
import type { IssueLevel } from "#/docker/validate";
import { issuesAtom } from "#/store/generator-store";
import InlineText from "../InlineText";

const LEVEL_STYLE: Record<IssueLevel, string> = {
	error: "demo-alert demo-alert-danger",
	warning: "demo-alert",
	info: "demo-list-item",
};

const LEVEL_LABEL: Record<IssueLevel, string> = {
	error: "Will be rejected",
	warning: "Likely a mistake",
	info: "Worth knowing",
};

/**
 * Cross-field review of the current configuration. These are the combinations
 * that produce a confusing daemon error — or worse, quietly degraded behaviour
 * — rather than a clean validation failure.
 */
export default function IssueList() {
	const issues = useSelector(issuesAtom);

	if (issues.length === 0) {
		return (
			<div className="demo-panel">
				<p className="island-kicker mb-2">Review</p>
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
					No conflicts detected in the current selection.
				</p>
			</div>
		);
	}

	return (
		<div className="demo-panel flex flex-col gap-3">
			<div>
				<p className="island-kicker mb-1">Review</p>
				<h2 className="demo-section-title">
					{issues.length} thing{issues.length === 1 ? "" : "s"} to check
				</h2>
			</div>

			{issues.map((issue) => (
				<div
					key={`${issue.level}-${issue.title}`}
					className={`${LEVEL_STYLE[issue.level]} flex flex-col gap-1`}
				>
					<div className="flex flex-wrap items-center gap-2">
						<span className="demo-pill">{LEVEL_LABEL[issue.level]}</span>
						<strong className="text-sm text-[var(--sea-ink)]">
							{issue.title}
						</strong>
					</div>
					<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
						<InlineText text={issue.detail} />
					</p>
					<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
						{issue.fieldIds.map((fieldId) => (
							<code key={fieldId} className="mr-2 text-[0.7rem]">
								{fieldId}
							</code>
						))}
					</p>
				</div>
			))}
		</div>
	);
}
