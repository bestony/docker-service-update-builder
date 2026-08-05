import { queryOptions } from "@tanstack/react-query";
import type { Post } from "./posts";

/**
 * The field guide is loaded through TanStack Query rather than imported
 * directly. Two reasons: the dynamic import keeps the prose out of the initial
 * bundle, and the query cache means the builder page and the blog routes share
 * one fetch — the route loader primes it, components read it synchronously.
 */
async function loadPosts(): Promise<Array<Post>> {
	const module = await import("./posts");
	return module.posts;
}

export function postsQueryOptions() {
	return queryOptions({
		queryKey: ["posts"] as const,
		queryFn: loadPosts,
		// The content is baked into the bundle, so it can never go stale.
		staleTime: Number.POSITIVE_INFINITY,
	});
}

export function postQueryOptions(slug: string) {
	return queryOptions({
		queryKey: ["posts", slug] as const,
		queryFn: async () => {
			const all = await loadPosts();
			return all.find((post) => post.slug === slug) ?? null;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});
}
