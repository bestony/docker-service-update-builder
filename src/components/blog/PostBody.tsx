import { Banner, Text } from "@cloudflare/kumo";
import { InfoIcon } from "@phosphor-icons/react";
import type { PostBlock } from "#/content/posts";
import InlineText from "../InlineText";

/**
 * Renders the structured content blocks. Keeping content as data rather than
 * markdown means no parser in the bundle and no `dangerouslySetInnerHTML`.
 *
 * Code blocks stay native `<pre><code>` on purpose: Kumo's `Code` pulls in a
 * syntax highlighter, which is a lot of bundle for a handful of JSON samples.
 */
export default function PostBody({ blocks }: { blocks: Array<PostBlock> }) {
	return (
		<div className="post-body">
			{blocks.map((block, index) => {
				const key = `${block.kind}-${index}`;

				switch (block.kind) {
					case "h":
						return (
							<Text key={key} variant="heading3" as="h2">
								{block.text}
							</Text>
						);
					case "ul":
						return (
							<ul key={key} className="post-body__list">
								{block.items.map((item) => (
									<li key={item}>
										<InlineText text={item} />
									</li>
								))}
							</ul>
						);
					case "code":
						return (
							// The wrapper owns the frame so the border stays put while the
							// sample scrolls sideways.
							<div key={key} className="post-body__code">
								<pre>
									<code>{block.code}</code>
								</pre>
							</div>
						);
					case "note":
						return (
							<Banner
								key={key}
								className="post-body__note"
								variant="default"
								size="sm"
								icon={<InfoIcon weight="fill" />}
								description={<InlineText text={block.text} />}
							/>
						);
					default:
						return (
							<Text key={key} variant="secondary">
								<InlineText text={block.text} />
							</Text>
						);
				}
			})}
		</div>
	);
}
