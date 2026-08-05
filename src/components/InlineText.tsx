import { Fragment, type ReactNode } from "react";

/**
 * Renders the two bits of inline markdown the copy actually uses: `code` and
 * *emphasis*. A full markdown parser would be a dependency and a
 * `dangerouslySetInnerHTML` for no benefit — this returns React elements, so
 * there is nothing to sanitise.
 */
const TOKEN = /(`[^`]+`|\*[^*]+\*)/g;

export function renderInline(text: string): ReactNode {
	const parts = text.split(TOKEN);

	return parts.map((part, index) => {
		const key = `${index}-${part}`;

		if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
			return <code key={key}>{part.slice(1, -1)}</code>;
		}
		if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
			return <em key={key}>{part.slice(1, -1)}</em>;
		}
		return <Fragment key={key}>{part}</Fragment>;
	});
}

export default function InlineText({ text }: { text: string }) {
	return <>{renderInline(text)}</>;
}
