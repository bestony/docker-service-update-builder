import { Button } from "@cloudflare/kumo";
import { CheckIcon, CopyIcon, WarningIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface CopyButtonProps {
	/** Resolved lazily so the caller can hand over `window.location.href`. */
	getText: () => string;
	label: string;
}

type Status = "idle" | "copied" | "failed";

const ICON = {
	idle: CopyIcon,
	copied: CheckIcon,
	failed: WarningIcon,
} as const;

/**
 * Clipboard access is browser-only, but it is reached from an event handler so
 * there is nothing to guard at render time — the component renders identically
 * on the server and on first hydration.
 */
export default function CopyButton({ getText, label }: CopyButtonProps) {
	const [status, setStatus] = useState<Status>("idle");

	useEffect(() => {
		if (status === "idle") return;
		const timer = setTimeout(() => setStatus("idle"), 1800);
		return () => clearTimeout(timer);
	}, [status]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(getText());
			setStatus("copied");
		} catch {
			// Fires on http:// origins, where the clipboard API is unavailable.
			setStatus("failed");
		}
	}

	return (
		<Button variant="secondary" size="sm" icon={ICON[status]} onClick={copy}>
			{status === "copied"
				? "Copied"
				: status === "failed"
					? "Copy blocked"
					: label}
		</Button>
	);
}
