import { Badge, Text } from "@cloudflare/kumo";
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
		<main className="page page--center">
			<div className="panel blog-not-found">
				<Text variant="heading2" as="h1">
					No such post
				</Text>
				<Text variant="secondary" size="sm">
					That slug is not part of the field guide.
				</Text>
				<Link to="/blog" className="blog-chip">
					Back to the field guide
				</Link>
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
		<main className="page blog-post">
			<article className="panel blog-post__article">
				<div className="blog-post__meta">
					{post.tags.map((tag) => (
						<Badge key={tag} variant="neutral">
							{tag}
						</Badge>
					))}
					<span className="blog-post__byline">
						{post.date} · {post.readingMinutes} min read
					</span>
				</div>

				<Text variant="heading1" as="h1">
					{post.title}
				</Text>
				<Text variant="secondary">{post.summary}</Text>

				<PostBody blocks={post.blocks} />
			</article>

			{relatedSections.length > 0 ? (
				<section className="panel">
					<p className="kicker">Configure it</p>
					<Text variant="secondary" size="sm">
						Sections of the builder that cover what this post describes:
					</Text>
					{/* These stay router links rather than Kumo Buttons: they navigate, so
					    they must remain real anchors for middle-click and copy-link. */}
					<ul className="blog-post__section-links">
						{relatedSections.map((section) => (
							<li key={section.id}>
								<Link to="/" className="blog-chip">
									{section.title}
								</Link>
							</li>
						))}
					</ul>
				</section>
			) : null}

			<Link to="/blog" className="blog-post__back">
				← All posts
			</Link>
		</main>
	);
}
