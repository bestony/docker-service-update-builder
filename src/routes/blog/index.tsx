import { Badge, Text } from "@cloudflare/kumo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { postsQueryOptions } from "#/content/posts-query";
import { localizedPostText, useI18n } from "#/i18n";

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
	const { locale, t } = useI18n();
	const { data: posts } = useSuspenseQuery(postsQueryOptions());

	return (
		<main className="page blog-index">
			<section className="panel panel--hero rise-in">
				<p className="kicker">{t("blog.kicker")}</p>
				<Text variant="heading1" as="h1">
					{t("blog.title")}
				</Text>
				{/* Kumo's Text takes no className, so the measure lives on a wrapper. */}
				<div className="measure">
					<Text variant="secondary">{t("blog.intro")}</Text>
				</div>
			</section>

			<div className="blog-index__grid">
				{posts.map((post) => {
					const text = localizedPostText(post.slug, locale, post);

					return (
						<article key={post.slug} className="panel blog-index__card">
							<div className="blog-index__meta">
								{post.tags.map((tag) => (
									<Badge key={tag} variant="neutral">
										{tag}
									</Badge>
								))}
								<span className="blog-index__reading">
									{t("blog.reading", { minutes: post.readingMinutes })}
								</span>
							</div>
							<Text variant="heading3" as="h2">
								<Link
									to="/blog/$slug"
									params={{ slug: post.slug }}
									className="blog-index__title-link"
								>
									{text.title}
								</Link>
							</Text>
							<Text variant="secondary" size="sm">
								{text.summary}
							</Text>
							<Text variant="secondary" size="xs">
								{post.date}
							</Text>
						</article>
					);
				})}
			</div>
		</main>
	);
}
