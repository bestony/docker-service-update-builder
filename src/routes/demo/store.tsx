import { Input, Text } from "@cloudflare/kumo";
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";

import { fullName, store } from "#/lib/demo-store";

export const Route = createFileRoute("/demo/store")({
	component: DemoStore,
});

function FirstName() {
	const firstName = useStore(store, (state) => state.firstName);
	return (
		<Input
			label="First name"
			type="text"
			value={firstName}
			onChange={(e) =>
				store.setState((state) => ({ ...state, firstName: e.target.value }))
			}
		/>
	);
}

function LastName() {
	const lastName = useStore(store, (state) => state.lastName);
	return (
		<Input
			label="Last name"
			type="text"
			value={lastName}
			onChange={(e) =>
				store.setState((state) => ({ ...state, lastName: e.target.value }))
			}
		/>
	);
}

function FullName() {
	const fName = useStore(fullName, (state) => state);
	return (
		<div className="demo-card">
			<Text bold>{fName}</Text>
		</div>
	);
}

function DemoStore() {
	return (
		<main className="page page--center">
			<section className="panel demo-panel">
				<p className="kicker">TanStack Store</p>
				<Text variant="heading1" as="h1">
					Store Example
				</Text>
				<FirstName />
				<LastName />
				<FullName />
			</section>
		</main>
	);
}
