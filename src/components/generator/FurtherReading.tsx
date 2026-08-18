import { Loader, Text } from "@cloudflare/kumo";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { postsQueryOptions } from "#/content/posts-query";
import { isFieldActive } from "#/docker/build-spec";
import { SECTIONS } from "#/docker/catalog";
import { localizedPostText, useI18n } from "#/i18n";
import { generatorStore } from "#/store/generator-store";

/**
 * Surfaces the field guide entries that explain whatever is currently switched
 * on. Reads through TanStack Query, so the blog routes and this panel share one
 * cache entry and one dynamic import.
 */
export default function FurtherReading() {
	const { locale, t } = useI18n();
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
		<div className="panel">
			<div className="further-reading__header">
				<p className="kicker">{t("reading.kicker")}</p>
				<Text variant="heading3" as="h2">
					{active.size === 0 ? t("reading.start") : t("reading.background")}
				</Text>
			</div>

			{isPending ? (
				<div className="further-reading__loading">
					<Loader size="sm" />
					<Text variant="secondary" size="sm" as="span">
						{t("reading.loading")}
					</Text>
				</div>
			) : null}

			<ul className="further-reading__list">
				{relevant.map((post) => {
					const text = localizedPostText(post.slug, locale, post);

					return (
						<li key={post.slug}>
							<Link
								to="/blog/$slug"
								params={{ slug: post.slug }}
								className="further-reading__card"
							>
								<strong className="further-reading__title">{text.title}</strong>
								<p className="further-reading__summary">{text.summary}</p>
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
