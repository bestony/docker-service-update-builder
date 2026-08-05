import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import PostBody from "#/components/blog/PostBody";
import { postQueryOptions } from "#/content/posts-query";
import { SECTIONS } from "#/docker/catalog";

export const Route = createFileRoute("/blog/$slug")({
	loader: async ({ context, params }) => {
		const post = await context.queryClient.ensureQueryData(
			postQueryOptions(params.slug),
		);
		// Throwing from the loader means the 404 is rendered on the server too,
		// instead of flashing an empty article first.
		if (!post) throw notFound();
		return { title: post.title, summary: post.summary };
	},
	head: ({ loaderData }) => ({
		meta: loaderData
			? [
					{ title: `${loaderData.title} — Field guide` },
					{ name: "description", content: loaderData.summary },
				]
			: [],
	}),
	component: BlogPost,
	notFoundComponent: () => (
		<main className="demo-page demo-center">
			<div className="demo-panel flex max-w-lg flex-col gap-3 text-center">
				<h1 className="demo-title text-2xl">No such post</h1>
				<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
					That slug is not part of the field guide.
				</p>
				<div>
					<Link to="/blog" className="demo-button no-underline">
						Back to the field guide
					</Link>
				</div>
			</div>
		</main>
	),
});

function BlogPost() {
	const { slug } = Route.useParams();
	const { data: post } = useSuspenseQuery(postQueryOptions(slug));

	if (!post) return null;

	const relatedSections = SECTIONS.filter((section) =>
		post.sections.includes(section.id),
	);

	return (
		<main className="demo-page flex flex-col gap-6">
			<article className="demo-panel flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2">
					{post.tags.map((tag) => (
						<span key={tag} className="demo-pill">
							{tag}
						</span>
					))}
					<span className="text-xs text-[var(--sea-ink-soft)]">
						{post.date} · {post.readingMinutes} min read
					</span>
				</div>

				<h1 className="demo-title text-3xl">{post.title}</h1>
				<p className="m-0 text-base text-[var(--sea-ink-soft)]">
					{post.summary}
				</p>

				<PostBody blocks={post.blocks} />
			</article>

			{relatedSections.length > 0 ? (
				<section className="demo-panel flex flex-col gap-3">
					<p className="island-kicker">Configure it</p>
					<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
						Sections of the builder that cover what this post describes:
					</p>
					<ul className="m-0 flex list-none flex-wrap gap-2 p-0">
						{relatedSections.map((section) => (
							<li key={section.id}>
								<Link to="/" className="demo-button no-underline text-xs">
									{section.title}
								</Link>
							</li>
						))}
					</ul>
				</section>
			) : null}

			<div>
				<Link to="/blog" className="text-sm">
					← All posts
				</Link>
			</div>
		</main>
	);
}
