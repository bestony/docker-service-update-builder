import { Badge, type BadgeVariant, Banner, Text } from "@cloudflare/kumo";
import { useSelector } from "@tanstack/react-store";
import type { ComponentProps } from "react";
import type { IssueLevel } from "#/docker/validate";
import { issuesAtom } from "#/store/generator-store";
import InlineText from "../InlineText";

type BannerVariant = ComponentProps<typeof Banner>["variant"];

const LEVEL_STYLE: Record<IssueLevel, BannerVariant> = {
	error: "error",
	warning: "alert",
	info: "secondary",
};

/** Kept in step with `LEVEL_STYLE` so the badge reads as part of its banner. */
const LEVEL_BADGE: Record<IssueLevel, BadgeVariant> = {
	error: "error",
	warning: "warning",
	info: "neutral",
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
			<div className="panel issue-list">
				<p className="kicker">Review</p>
				<Text variant="secondary" size="sm">
					No conflicts detected in the current selection.
				</Text>
			</div>
		);
	}

	return (
		<div className="panel issue-list">
			<div className="issue-list__header">
				<p className="kicker">Review</p>
				<Text variant="heading3" as="h2">
					{issues.length} thing{issues.length === 1 ? "" : "s"} to check
				</Text>
			</div>

			{issues.map((issue) => (
				<Banner
					key={`${issue.level}-${issue.title}`}
					variant={LEVEL_STYLE[issue.level]}
				>
					<div className="issue-list__issue">
						<div className="issue-list__heading">
							<Badge variant={LEVEL_BADGE[issue.level]}>
								{LEVEL_LABEL[issue.level]}
							</Badge>
							<strong className="issue-list__title">{issue.title}</strong>
						</div>
						<p className="issue-list__detail">
							<InlineText text={issue.detail} />
						</p>
						<p className="issue-list__fields">
							{issue.fieldIds.map((fieldId) => (
								<code key={fieldId}>{fieldId}</code>
							))}
						</p>
					</div>
				</Banner>
			))}
		</div>
	);
}
