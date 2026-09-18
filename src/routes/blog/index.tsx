import { Badge, Text } from "@cloudflare/kumo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { postsQueryOptions } from "#/content/posts-query";
import { useLocale, useT } from "#/i18n/locale-context";
import { translate } from "#/i18n/messages";

export const Route = createFileRoute("/blog/")({
	// The loader primes the query cache on the server, so useSuspenseQuery below
	// resolves synchronously during SSR and again after hydration. The root
	// `beforeLoad` has already resolved the locale into context, so the server
	// primes the exact entry the client will ask for.
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(postsQueryOptions(context.locale)),
	component: BlogIndex,
	head: ({ match }) => ({
		meta: [
			{ title: translate(match.context.locale, "blog.indexTitle") },
			{
				name: "description",
				content: translate(match.context.locale, "blog.indexDescription"),
			},
		],
	}),
});

function BlogIndex() {
	const t = useT();
	const { locale } = useLocale();
	const { data: posts } = useSuspenseQuery(postsQueryOptions(locale));

	return (
		<main className="page blog-index">
			<section className="panel panel--hero rise-in">
				<p className="kicker">{t("blog.kicker")}</p>
				<Text variant="heading1" as="h1">
					{t("blog.heading")}
				</Text>
				{/* Kumo's Text takes no className, so the measure lives on a wrapper. */}
				<div className="measure">
					<Text variant="secondary">{t("blog.intro")}</Text>
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
								{t("blog.minRead", { count: post.readingMinutes })}
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
