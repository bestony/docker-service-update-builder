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
		<main className="demo-page flex flex-col gap-6">
			<section className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10">
				<p className="island-kicker mb-3">Field guide</p>
				<h1 className="display-title mb-4 text-4xl leading-[1.05] font-bold tracking-tight text-[var(--sea-ink)]">
					The parts that are not in the schema.
				</h1>
				<p className="m-0 max-w-2xl text-base text-[var(--sea-ink-soft)]">
					The Engine API reference tells you the type of every key. It does not
					tell you that the endpoint replaces the whole spec, that durations are
					nanoseconds, or why your rollout is quietly dropping connections.
					These posts do.
				</p>
			</section>

			<div className="grid gap-4 sm:grid-cols-2">
				{posts.map((post) => (
					<article key={post.slug} className="demo-panel flex flex-col gap-3">
						<div className="flex flex-wrap items-center gap-2">
							{post.tags.map((tag) => (
								<span key={tag} className="demo-pill">
									{tag}
								</span>
							))}
							<span className="text-xs text-[var(--sea-ink-soft)]">
								{post.readingMinutes} min read
							</span>
						</div>
						<h2 className="demo-section-title text-lg">
							<Link
								to="/blog/$slug"
								params={{ slug: post.slug }}
								className="no-underline"
							>
								{post.title}
							</Link>
						</h2>
						<p className="m-0 text-sm text-[var(--sea-ink-soft)]">
							{post.summary}
						</p>
						<p className="m-0 text-xs text-[var(--sea-ink-soft)]">
							{post.date}
						</p>
					</article>
				))}
			</div>
		</main>
	);
}
