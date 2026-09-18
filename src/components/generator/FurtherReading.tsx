import { Loader, Text } from "@cloudflare/kumo";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { postsQueryOptions } from "#/content/posts-query";
import { isFieldActive } from "#/docker/build-spec";
import { getSections } from "#/i18n/catalog";
import { useLocale, useT } from "#/i18n/locale-context";
import { generatorStore } from "#/store/generator-store";

/**
 * Surfaces the field guide entries that explain whatever is currently switched
 * on. Reads through TanStack Query, so the blog routes and this panel share one
 * cache entry and one dynamic import — per locale, since the query key carries
 * it.
 */
export default function FurtherReading() {
	const t = useT();
	const { locale } = useLocale();
	const { data: posts, isPending } = useQuery(postsQueryOptions(locale));

	const activeSections = useSelector(generatorStore, (state) => {
		const ids = getSections(locale)
			.filter((section) =>
				section.fields.some((field) => {
					const fieldState = state.states[field.id];
					return fieldState ? isFieldActive(field, fieldState) : false;
				}),
			)
			.map((section) => section.id);
		return ids.join(",");
	});

	const active = new Set(activeSections.split(",").filter(Boolean));
	const relevant = (posts ?? []).filter(
		(post) =>
			active.size === 0 || post.sections.some((section) => active.has(section)),
	);

	return (
		<div className="panel">
			<div className="further-reading__header">
				<p className="kicker">{t("furtherReading.kicker")}</p>
				<Text variant="heading3" as="h2">
					{active.size === 0
						? t("furtherReading.startHere")
						: t("furtherReading.forConfigured")}
				</Text>
			</div>

			{isPending ? (
				<div className="further-reading__loading">
					<Loader size="sm" />
					<Text variant="secondary" size="sm" as="span">
						{t("furtherReading.loading")}
					</Text>
				</div>
			) : null}

			<ul className="further-reading__list">
				{relevant.map((post) => (
					<li key={post.slug}>
						<Link
							to="/blog/$slug"
							params={{ slug: post.slug }}
							className="further-reading__card"
						>
							<strong className="further-reading__title">{post.title}</strong>
							<p className="further-reading__summary">{post.summary}</p>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
