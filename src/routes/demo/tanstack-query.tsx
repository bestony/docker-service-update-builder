import { Text } from "@cloudflare/kumo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo/tanstack-query")({
	component: TanStackQueryDemo,
});

function TanStackQueryDemo() {
	const { data } = useQuery({
		queryKey: ["todos"],
		queryFn: () =>
			Promise.resolve([
				{ id: 1, name: "Alice" },
				{ id: 2, name: "Bob" },
				{ id: 3, name: "Charlie" },
			]),
		initialData: [],
	});

	return (
		<main className="page page--center">
			<section className="panel demo-panel demo-panel--wide">
				<p className="kicker">TanStack Query</p>
				<Text variant="heading1" as="h1">
					TanStack Query Simple Promise Handling
				</Text>
				<ul className="demo-list">
					{data.map((todo) => (
						<li key={todo.id} className="demo-card">
							<Text as="span" bold>
								{todo.name}
							</Text>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
