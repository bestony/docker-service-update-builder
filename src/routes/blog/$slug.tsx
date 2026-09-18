import { Badge, Text } from "@cloudflare/kumo";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import PostBody from "#/components/blog/PostBody";
import { postQueryOptions } from "#/content/posts-query";
import { getSections } from "#/i18n/catalog";
import { useLocale, useT } from "#/i18n/locale-context";
import { translate } from "#/i18n/messages";

export const Route = createFileRoute("/blog/$slug")({
	loader: async ({ context, params }) => {
		const post = await context.queryClient.ensureQueryData(
			postQueryOptions(context.locale, params.slug),
		);
		// Throwing from the loader means the 404 is rendered on the server too,
		// instead of flashing an empty article first.
		if (!post) throw notFound();
		return { title: post.title, summary: post.summary };
	},
	head: ({ loaderData, match }) => ({
		meta: loaderData
			? [
					{
						title: translate(match.context.locale, "blog.postTitle", {
							title: loaderData.title,
						}),
					},
					{ name: "description", content: loaderData.summary },
				]
			: [],
	}),
	component: BlogPost,
	notFoundComponent: BlogNotFound,
});

function BlogNotFound() {
	const t = useT();

	return (
		<main className="page page--center">
			<div className="panel blog-not-found">
				<Text variant="heading2" as="h1">
					{t("blog.notFoundHeading")}
				</Text>
				<Text variant="secondary" size="sm">
					{t("blog.notFoundBody")}
				</Text>
				<Link to="/blog" className="blog-chip">
					{t("blog.notFoundLink")}
				</Link>
			</div>
		</main>
	);
}

function BlogPost() {
	const t = useT();
	const { locale } = useLocale();
	const { slug } = Route.useParams();
	const { data: post } = useSuspenseQuery(postQueryOptions(locale, slug));

	if (!post) return null;

	const relatedSections = getSections(locale).filter((section) =>
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
						{t("blog.byline", {
							date: post.date,
							count: post.readingMinutes,
						})}
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
					<p className="kicker">{t("blog.configureIt")}</p>
					<Text variant="secondary" size="sm">
						{t("blog.configureItBody")}
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
				{t("blog.allPosts")}
			</Link>
		</main>
	);
}
