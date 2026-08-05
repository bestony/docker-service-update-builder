import type { PostBlock } from "#/content/posts";
import InlineText from "../InlineText";

/**
 * Renders the structured content blocks. Keeping content as data rather than
 * markdown means no parser in the bundle and no `dangerouslySetInnerHTML`.
 */
export default function PostBody({ blocks }: { blocks: Array<PostBlock> }) {
	return (
		<div className="flex flex-col gap-4">
			{blocks.map((block, index) => {
				const key = `${block.kind}-${index}`;

				switch (block.kind) {
					case "h":
						return (
							<h2 key={key} className="demo-section-title mt-2 text-lg">
								{block.text}
							</h2>
						);
					case "ul":
						return (
							<ul
								key={key}
								className="m-0 list-disc space-y-2 pl-5 text-[var(--sea-ink-soft)]"
							>
								{block.items.map((item) => (
									<li key={item}>
										<InlineText text={item} />
									</li>
								))}
							</ul>
						);
					case "code":
						return (
							<pre
								key={key}
								className="demo-code-block m-0 overflow-auto text-xs leading-relaxed"
							>
								<code>{block.code}</code>
							</pre>
						);
					case "note":
						return (
							<p key={key} className="demo-alert m-0 text-sm">
								<InlineText text={block.text} />
							</p>
						);
					default:
						return (
							<p key={key} className="m-0 text-[var(--sea-ink-soft)]">
								<InlineText text={block.text} />
							</p>
						);
				}
			})}
		</div>
	);
}
