import { Text } from "@cloudflare/kumo";
import { EventClient } from "@tanstack/devtools-event-client";
import { useEffect, useState } from "react";

import { fullName, store } from "./demo-store";

type EventMap = {
	"store-devtools:state": {
		firstName: string;
		lastName: string;
		fullName: string;
	};
};

class StoreDevtoolsEventClient extends EventClient<EventMap> {
	constructor() {
		super({
			pluginId: "store-devtools",
		});
	}
}

const sdec = new StoreDevtoolsEventClient();

// The event name carries the pluginId prefix. Older @tanstack/devtools-event-client
// releases prepended it for you, which is why the CLI add-on emits a bare "state".
store.subscribe(() => {
	sdec.emit("store-devtools:state", {
		firstName: store.state.firstName,
		lastName: store.state.lastName,
		fullName: fullName.state,
	});
});

function DevtoolPanel() {
	const [state, setState] = useState<EventMap["store-devtools:state"]>(() => ({
		firstName: store.state.firstName,
		lastName: store.state.lastName,
		fullName: fullName.state,
	}));

	useEffect(() => {
		return sdec.on("store-devtools:state", (e) => setState(e.payload));
	}, []);

	return (
		<div className="store-devtools">
			<Text variant="secondary" size="sm" bold>
				First Name
			</Text>
			<Text size="sm">{state?.firstName}</Text>
			<Text variant="secondary" size="sm" bold>
				Last Name
			</Text>
			<Text size="sm">{state?.lastName}</Text>
			<Text variant="secondary" size="sm" bold>
				Full Name
			</Text>
			<Text size="sm">{state?.fullName}</Text>
		</div>
	);
}

export default {
	name: "TanStack Store",
	render: <DevtoolPanel />,
};
