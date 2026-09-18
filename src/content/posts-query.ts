import { queryOptions } from "@tanstack/react-query";
import type { Locale } from "#/i18n/locale";
import type { Post } from "./posts";

/**
 * The field guide is loaded through TanStack Query rather than imported
 * directly. Two reasons: the dynamic import keeps the prose out of the initial
 * bundle, and the query cache means the builder page and the blog routes share
 * one fetch — the route loader primes it, components read it synchronously.
 *
 * The locale is part of the query key, so switching language loads the other
 * array instead of serving the cached one. Each language is its own import, so
 * a Chinese reader never downloads the English prose either.
 */
async function loadPosts(locale: Locale): Promise<Array<Post>> {
	if (locale === "zh") {
		const module = await import("./posts.zh");
		return module.postsZh;
	}
	const module = await import("./posts");
	return module.posts;
}

export function postsQueryOptions(locale: Locale) {
	return queryOptions({
		queryKey: ["posts", locale] as const,
		queryFn: () => loadPosts(locale),
		// The content is baked into the bundle, so it can never go stale.
		staleTime: Number.POSITIVE_INFINITY,
	});
}

export function postQueryOptions(locale: Locale, slug: string) {
	return queryOptions({
		queryKey: ["posts", locale, slug] as const,
		queryFn: async () => {
			const all = await loadPosts(locale);
			return all.find((post) => post.slug === slug) ?? null;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
}
