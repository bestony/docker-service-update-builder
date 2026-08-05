import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { postsQueryOptions } from "#/content/posts-query";
import { isFieldActive } from "#/docker/build-spec";
import { SECTIONS } from "#/docker/catalog";
import { generatorStore } from "#/store/generator-store";

/**
 * Surfaces the field guide entries that explain whatever is currently switched
 * on. Reads through TanStack Query, so the blog routes and this panel share one
 * cache entry and one dynamic import.
 */
export default function FurtherReading() {
	const { data: posts, isPending } = useQuery(postsQueryOptions());

	const activeSections = useSelector(generatorStore, (state) => {
		const ids = SECTIONS.filter((section) =>
			section.fields.some((field) => {
				const fieldState = state.states[field.id];
				return fieldState ? isFieldActive(field, fieldState) : false;
			}),
		).map((section) => section.id);
		return ids.join(",");
	});

	const active = new Set(activeSections.split(",").filter(Boolean));
	const relevant = (posts ?? []).filter(
		(post) =>
			active.size === 0 || post.sections.some((section) => active.has(section)),
	);

	return (
		<div className="demo-panel flex flex-col gap-3">
			<div>
				<p className="island-kicker mb-1">Field guide</p>
				<h2 className="demo-section-title">
					{active.size === 0
						? "Start here"
						: "Background for what you have configured"}
				</h2>
			</div>

			{isPending ? (
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">Loading…</p>
			) : null}

			<ul className="m-0 flex list-none flex-col gap-2 p-0">
				{relevant.map((post) => (
					<li key={post.slug}>
						<Link
							to="/blog/$slug"
							params={{ slug: post.slug }}
							className="demo-list-item block no-underline"
						>
							<strong className="text-sm text-[var(--sea-ink)]">
								{post.title}
							</strong>
							<p className="m-0 mt-1 text-sm text-[var(--sea-ink-soft)]">
								{post.summary}
							</p>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
