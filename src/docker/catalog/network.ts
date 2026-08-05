import type { SectionDef } from "../field-types";

export const networkSection: SectionDef = {
	id: "network",
	title: "Networking",
	path: "TaskTemplate.Networks / EndpointSpec",
	summary:
		"Which overlay networks the tasks join, and how the service is reachable from outside the cluster.",
	details: [
		"There are two `Networks` keys in the spec. The one under `TaskTemplate` is current; the top-level `ServiceSpec.Networks` is deprecated since API v1.44 and only kept for old clients. This builder writes the `TaskTemplate` one.",
		"Attaching or detaching a network always recreates every task — there is no in-place network change.",
	],
	fields: [
		{
			id: "networks",
			path: "TaskTemplate.Networks",
			key: "Networks",
			type: "rows",
			title: "Network attachments",
			summary:
				"Overlay networks the tasks attach to, with optional DNS aliases.",
			details: [
				"`Target` is a network name or ID; the network must already exist and be attachable. Aliases give the service extra DNS names on that network, which is how you migrate a consumer to a renamed service without touching the consumer.",
			],
			columns: [
				{
					key: "Target",
					label: "Network",
					type: "text",
					placeholder: "backend-net",
					hint: "Name or ID of an existing overlay network.",
				},
				{
					key: "Aliases",
					label: "Aliases (comma separated)",
					type: "text",
					placeholder: "api,api-v2",
					split: "comma",
					hint: "Extra DNS names resolvable on this network.",
				},
			],
			cli: "docker service update --network-add backend-net",
			compose: "services.<key>.networks",
		},
		{
			id: "endpoint-mode",
			path: "EndpointSpec.Mode",
			key: "Mode",
			type: "select",
			title: "Endpoint mode",
			summary:
				"How internal clients resolve and load balance across the tasks.",
			details: [
				"`vip` gives the service one stable virtual IP and lets the kernel's IPVS spread connections across tasks. It is the default and what almost everything should use.",
				"`dnsrr` returns the task IPs directly from DNS with no virtual IP. Pick it when your client does its own load balancing or needs to see individual replicas — but beware of DNS caching in the client runtime.",
			],
			options: [
				{
					value: "vip",
					label: "vip",
					hint: "One virtual IP, kernel-side load balancing. The default.",
				},
				{
					value: "dnsrr",
					label: "dnsrr",
					hint: "DNS round-robin over task IPs. Cannot publish ports.",
				},
			],
			apiDefault: "vip",
			cli: "docker service update --endpoint-mode dnsrr",
			compose: "services.<key>.deploy.endpoint_mode",
			caution:
				"Ports can only be published in vip mode. A spec combining dnsrr with EndpointSpec.Ports is rejected by the daemon.",
		},
		{
			id: "ports",
			path: "EndpointSpec.Ports",
			key: "Ports",
			type: "rows",
			title: "Published ports",
			summary: "Ports exposed outside the cluster.",
			details: [
				"`ingress` publishes the port on *every* node through the routing mesh, so any node's IP works even if no task runs there. `host` bypasses the mesh and binds the port only on nodes actually running a task — faster, preserves the client source IP, but the port is then an exclusive node resource.",
				"Publishing the whole `Ports` array replaces the previous one; leaving it out removes every published port.",
			],
			columns: [
				{
					key: "Name",
					label: "Name",
					type: "text",
					placeholder: "http",
					width: "w-32",
					hint: "Optional label for the port entry.",
				},
				{
					key: "Protocol",
					label: "Protocol",
					type: "select",
					options: [
						{ value: "tcp", label: "tcp", hint: "The default." },
						{
							value: "udp",
							label: "udp",
							hint: "Datagram traffic; the routing mesh supports it.",
						},
						{
							value: "sctp",
							label: "sctp",
							hint: "Rarely used; requires kernel support.",
						},
					],
					width: "w-32",
					hint: "Transport protocol.",
				},
				{
					key: "TargetPort",
					label: "Target port",
					type: "number",
					placeholder: "8080",
					width: "w-32",
					hint: "The port the process listens on inside the container.",
				},
				{
					key: "PublishedPort",
					label: "Published port",
					type: "number",
					placeholder: "80",
					width: "w-36",
					hint: "The port exposed on the swarm nodes.",
				},
				{
					key: "PublishMode",
					label: "Publish mode",
					type: "select",
					options: [
						{
							value: "ingress",
							label: "ingress",
							hint: "Routing mesh: reachable on every node. The default.",
						},
						{
							value: "host",
							label: "host",
							hint: "Bind directly on the node running the task; blocks start-first rollouts.",
						},
					],
					width: "w-36",
					hint: "Whether the port goes through the routing mesh.",
				},
			],
			cli: "docker service update --publish-add published=80,target=8080,mode=ingress",
			compose: "services.<key>.ports",
		},
	],
};

export const taskMiscSection: SectionDef = {
	id: "task-misc",
	title: "Task template extras",
	path: "TaskTemplate",
	summary:
		"Logging, runtime selection, and the counter that forces a redeploy.",
	fields: [
		{
			id: "force-update",
			path: "TaskTemplate.ForceUpdate",
			key: "ForceUpdate",
			type: "number",
			title: "Force update counter",
			summary:
				"An arbitrary counter whose change alone triggers a rolling redeploy.",
			details: [
				"Swarm only redeploys when the spec differs. If you re-pushed `myapp:latest` and want the cluster to pull it again, nothing in the spec has changed — so you bump this integer and the rollout runs, honouring UpdateConfig exactly like a real change.",
				"Read the current value from `GET /services/{id}` and send it plus one. Sending the same value is a no-op.",
			],
			placeholder: "1",
			cli: "docker service update --force api-gateway",
		},
		{
			id: "runtime",
			path: "TaskTemplate.Runtime",
			key: "Runtime",
			type: "text",
			title: "Runtime",
			summary: "Which task executor runs the workload.",
			details: [
				"Leave empty for normal container services. `plugin` and `attachment` select the other two spec shapes and are not used by application services.",
			],
			placeholder: "container",
		},
		{
			id: "log-driver-name",
			path: "TaskTemplate.LogDriver.Name",
			key: "Name",
			type: "text",
			title: "Log driver",
			summary: "Log driver used by tasks of this service.",
			details: [
				"Overrides the daemon default per service — useful when one noisy service should ship to a remote collector while everything else stays on json-file.",
				"Common values: `json-file`, `local`, `journald`, `gelf`, `fluentd`, `awslogs`, `none`.",
			],
			placeholder: "json-file",
			cli: "docker service update --log-driver json-file",
			compose: "services.<key>.logging.driver",
			caution:
				"`docker service logs` stops working for drivers that do not support reading back, such as gelf or fluentd.",
		},
		{
			id: "log-driver-options",
			path: "TaskTemplate.LogDriver.Options",
			key: "Options",
			type: "mapLines",
			title: "Log driver options",
			summary: "Driver-specific options as `key=value` lines.",
			details: [
				"For `json-file` the two that matter are `max-size` and `max-file`; without them a chatty container can fill the node's disk.",
			],
			placeholder: "max-size=10m\nmax-file=3",
			cli: "docker service update --log-opt max-size=10m",
			compose: "services.<key>.logging.options",
			lineHint: "kv",
		},
		{
			id: "dns-nameservers",
			path: "TaskTemplate.ContainerSpec.DNSConfig.Nameservers",
			key: "Nameservers",
			type: "lines",
			title: "DNS nameservers",
			summary: "Nameserver IPs written into the container's resolv.conf.",
			details: [
				"Overriding this replaces Docker's embedded DNS server at 127.0.0.11, which is what resolves other service names. Add it back explicitly or service discovery stops working.",
			],
			placeholder: "127.0.0.11\n10.0.0.53",
			cli: "docker service update --dns-add 10.0.0.53",
			compose: "services.<key>.dns",
			caution:
				"Dropping 127.0.0.11 from the list breaks Swarm's internal service discovery.",
		},
		{
			id: "dns-search",
			path: "TaskTemplate.ContainerSpec.DNSConfig.Search",
			key: "Search",
			type: "lines",
			title: "DNS search domains",
			summary: "Search suffixes appended to unqualified lookups.",
			details: [
				"Each extra suffix costs a round trip on every failed lookup, so keep the list short.",
			],
			placeholder: "svc.internal",
			cli: "docker service update --dns-search-add svc.internal",
			compose: "services.<key>.dns_search",
		},
		{
			id: "dns-options",
			path: "TaskTemplate.ContainerSpec.DNSConfig.Options",
			key: "Options",
			type: "lines",
			title: "DNS resolver options",
			summary: "Resolver flags such as `ndots:1` or `timeout:1`.",
			details: [
				"`ndots:1` is a common fix for the extra DNS round trips that hit services doing many outbound lookups to fully qualified names.",
			],
			placeholder: "ndots:1\ntimeout:1",
			cli: "docker service update --dns-option-add ndots:1",
			compose: "services.<key>.dns_opt",
		},
	],
};

export const requestSection: SectionDef = {
	id: "request",
	title: "Request options",
	path: "POST /services/{id}/update",
	summary:
		"Query string and header inputs of the endpoint itself. These are *not* part of the JSON body.",
	target: "request",
	details: [
		"`version` is mandatory and is the optimistic-concurrency token. Read `Version.Index` from `GET /services/{id}` and send exactly that value; if someone else updated the service in the meantime the daemon answers 409 and your write is rejected rather than silently clobbering theirs.",
	],
	fields: [
		{
			id: "req-service-id",
			path: "id",
			key: "id",
			type: "text",
			title: "Service ID or name",
			summary: "Path parameter identifying the service to update.",
			details: ["Either the full ID or the service name works."],
			placeholder: "api-gateway",
			defaultValue: "api-gateway",
			// Without it the curl preview renders a placeholder, which reads like a bug.
			defaultEnabled: true,
		},
		{
			id: "req-version",
			path: "version",
			key: "version",
			type: "number",
			title: "version (required)",
			summary:
				"The service's current version index, used to detect conflicting writes.",
			details: [
				"Take it from `Version.Index` in the response of `GET /services/{id}` — the value *before* your update. Every successful update increments it.",
				"Omitting it or sending a stale value returns `409 Conflict: update out of sequence`.",
			],
			placeholder: "42",
		},
		{
			id: "req-rollback",
			path: "rollback",
			key: "rollback",
			type: "select",
			title: "rollback",
			summary:
				"Ask the daemon to restore the previous spec and ignore the body.",
			details: [
				"Set to `previous` for a manual rollback. The JSON body is still required by the endpoint but its contents are discarded.",
			],
			options: [
				{
					value: "previous",
					label: "previous",
					hint: "Server-side revert to PreviousSpec; the request body is ignored.",
				},
			],
			cli: "docker service rollback api-gateway",
		},
		{
			id: "req-registry-auth-from",
			path: "registryAuthFrom",
			key: "registryAuthFrom",
			type: "select",
			title: "registryAuthFrom",
			summary:
				"Where to take registry credentials from when no auth header is sent.",
			details: [
				"Only consulted when the `X-Registry-Auth` header is absent. During a rollback you usually want `previous-spec`, because the credentials that worked for the old image are the ones stored there.",
			],
			options: [
				{
					value: "spec",
					label: "spec",
					hint: "Use the credentials attached to the spec being applied. The default.",
				},
				{
					value: "previous-spec",
					label: "previous-spec",
					hint: "Reuse the credentials from the previous spec; the usual pick for rollbacks.",
				},
			],
			apiDefault: "spec",
			cli: "docker service update --with-registry-auth",
		},
	],
};
