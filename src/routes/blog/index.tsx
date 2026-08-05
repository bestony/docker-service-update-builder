import { Badge, Text } from "@cloudflare/kumo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { postsQueryOptions } from "#/content/posts-query";

export const Route = createFileRoute("/blog/")({
	// The loader primes the query cache on the server, so useSuspenseQuery below
	// resolves synchronously during SSR and again after hydration.
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(postsQueryOptions()),
	component: BlogIndex,
	head: () => ({
		meta: [
			{ title: "Field guide — Docker Service Update Builder" },
			{
				name: "description",
				content:
					"The mental model behind Docker Swarm service updates: spec replacement, units, rollouts and rollback.",
			},
		],
	}),
});

function BlogIndex() {
	const { data: posts } = useSuspenseQuery(postsQueryOptions());

	return (
		<main className="page blog-index">
			<section className="panel panel--hero rise-in">
				<p className="kicker">Field guide</p>
				<Text variant="heading1" as="h1">
					The parts that are not in the schema.
				</Text>
				{/* Kumo's Text takes no className, so the measure lives on a wrapper. */}
				<div className="measure">
					<Text variant="secondary">
						The Engine API reference tells you the type of every key. It does
						not tell you that the endpoint replaces the whole spec, that
						durations are nanoseconds, or why your rollout is quietly dropping
						connections. These posts do.
					</Text>
				</div>
			</section>

			<div className="blog-index__grid">
				{posts.map((post) => (
					<article key={post.slug} className="panel blog-index__card">
						<div className="blog-index__meta">
							{post.tags.map((tag) => (
								<Badge key={tag} variant="neutral">
									{tag}
								</Badge>
							))}
							<span className="blog-index__reading">
								{post.readingMinutes} min read
							</span>
						</div>
						<Text variant="heading3" as="h2">
							<Link
								to="/blog/$slug"
								params={{ slug: post.slug }}
								className="blog-index__title-link"
							>
								{post.title}
							</Link>
						</Text>
						<Text variant="secondary" size="sm">
							{post.summary}
						</Text>
						<Text variant="secondary" size="xs">
							{post.date}
						</Text>
					</article>
				))}
			</div>
		</main>
	);
}
