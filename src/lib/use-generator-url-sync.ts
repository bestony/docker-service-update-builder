import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { decodeStates, encodeStates } from "#/docker/share-link";
import type { OutputFormat } from "#/store/generator-store";
import { generatorStore } from "#/store/generator-store";

const SYNC_DEBOUNCE_MS = 400;

export interface GeneratorSearch {
	c?: string;
	f?: OutputFormat;
}

/**
 * Keeps the builder permalinkable without making the URL the source of truth.
 *
 * The store stays authoritative so typing never round-trips through the router;
 * the URL is written back on a debounce, and read exactly once on mount. The
 * one-shot guard is what stops the write-back from re-triggering hydration.
 */
export function useGeneratorUrlSync(search: GeneratorSearch): void {
	const navigate = useNavigate({ from: "/" });
	const hydrated = useRef(false);

	useEffect(() => {
		if (hydrated.current) return;
		hydrated.current = true;

		if (search.c) generatorStore.actions.hydrate(decodeStates(search.c));
		if (search.f) generatorStore.actions.setFormat(search.f);
	}, [search.c, search.f]);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;

		const subscription = generatorStore.subscribe(() => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				const state = generatorStore.state;
				const encoded = encodeStates(state.states);

				navigate({
					replace: true,
					search: (previous) => ({
						...previous,
						c: encoded === "" ? undefined : encoded,
						f: state.format === "json" ? undefined : state.format,
					}),
				});
			}, SYNC_DEBOUNCE_MS);
		});

		return () => {
			clearTimeout(timer);
			subscription.unsubscribe();
		};
	}, [navigate]);
}
