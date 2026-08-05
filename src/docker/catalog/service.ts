import type { SectionDef } from "../field-types";

export const serviceSection: SectionDef = {
	id: "service",
	title: "Service identity",
	path: "(root)",
	summary:
		"Top level keys of the ServiceSpec body — the service's name and its metadata.",
	details: [
		"These sit at the root of the JSON you POST to /services/{id}/update. `Name` is required by the daemon on every update: sending a spec without it is how services accidentally get renamed to an empty string.",
	],
	fields: [
		{
			id: "name",
			path: "Name",
			key: "Name",
			type: "text",
			title: "Service name",
			summary: "Name of the service.",
			details: [
				"The daemon treats the update body as the complete desired state, so `Name` must be present even when you are only changing something else. Keep it identical to the current name unless you actually intend to rename the service.",
				"Renaming a service is allowed but does not recreate its tasks; DNS entries on the attached overlay networks follow the new name.",
			],
			placeholder: "api-gateway",
			cli: "docker service create --name api-gateway",
			compose: "services.<key> (the map key is the name)",
			caution:
				"Omitting Name in an update body is a common cause of `rpc error: code = InvalidArgument desc = name must be valid`.",
		},
		{
			id: "labels",
			path: "Labels",
			key: "Labels",
			type: "mapLines",
			title: "Service labels",
			summary:
				"User-defined key/value metadata attached to the service object.",
			details: [
				"Service labels live on the service, not on its containers — use them for ownership, cost centre or routing metadata that tools such as Traefik read via the Swarm API.",
				"Labels are replaced wholesale on update. Anything you leave out of this map is deleted from the service.",
			],
			placeholder: "com.example.owner=platform\ntraefik.enable=true",
			cli: "docker service update --label-add com.example.owner=platform",
			compose: "services.<key>.deploy.labels",
			lineHint: "kv",
		},
	],
};

export const modeSection: SectionDef = {
	id: "mode",
	title: "Scheduling mode",
	path: "Mode",
	summary:
		"How many tasks Swarm runs and where — replicated, one-per-node, or a run-to-completion job.",
	details: [
		"`Mode` is a tagged union: exactly one of `Replicated`, `Global`, `ReplicatedJob` or `GlobalJob` may be present. Switching a live service between replicated and global is rejected by the daemon — you must remove and recreate it.",
	],
	fields: [
		{
			id: "mode-kind",
			path: "Mode",
			key: "Mode",
			type: "select",
			title: "Mode kind",
			summary: "Which of the four scheduling modes this service uses.",
			details: [
				"Replicated services run a fixed number of tasks spread across the cluster. Global services run exactly one task on every eligible node, which is what you want for log shippers and monitoring agents.",
				"The two job modes run tasks to completion instead of restarting them forever. They were added in API v1.41 and require Docker 20.10 or newer.",
			],
			options: [
				{
					value: "replicated",
					label: "Replicated",
					hint: "A fixed task count, scheduled anywhere that fits.",
				},
				{
					value: "global",
					label: "Global",
					hint: "Exactly one task per eligible node; replica count is ignored.",
				},
				{
					value: "replicated-job",
					label: "Replicated job",
					hint: "Runs N tasks to completion, then stops.",
				},
				{
					value: "global-job",
					label: "Global job",
					hint: "Runs one task to completion on every node.",
				},
			],
			valueMap: {
				replicated: { Replicated: {} },
				global: { Global: {} },
				"replicated-job": { ReplicatedJob: {} },
				"global-job": { GlobalJob: {} },
			},
			defaultValue: "replicated",
			cli: "docker service create --mode global",
			compose: "services.<key>.deploy.mode",
			caution:
				"You cannot convert an existing service between replicated and global; the daemon returns `rpc error: ... mode cannot be changed`.",
		},
		{
			id: "replicas",
			path: "Mode.Replicated.Replicas",
			key: "Replicas",
			type: "number",
			title: "Replica count",
			summary: "How many tasks a replicated service should keep running.",
			details: [
				"Scaling is the cheapest possible service update: the spec is otherwise unchanged, so Swarm only starts or stops tasks and never re-pulls the image.",
				"Setting this to 0 is the supported way to park a service — the spec stays intact and scaling back up needs no other change.",
			],
			placeholder: "3",
			cli: "docker service scale api-gateway=3",
			compose: "services.<key>.deploy.replicas",
		},
		{
			id: "job-max-concurrent",
			path: "Mode.ReplicatedJob.MaxConcurrent",
			key: "MaxConcurrent",
			type: "number",
			title: "Job max concurrent",
			summary: "Maximum number of job replicas running at the same time.",
			details: [
				"Only meaningful for `ReplicatedJob`. Use it to throttle a batch job so it does not saturate the cluster.",
			],
			apiDefault: "1",
			placeholder: "2",
			cli: "docker service create --mode replicated-job --max-concurrent 2",
		},
		{
			id: "job-total-completions",
			path: "Mode.ReplicatedJob.TotalCompletions",
			key: "TotalCompletions",
			type: "number",
			title: "Job total completions",
			summary: "Total number of replicas that must reach the Completed state.",
			details: [
				"When unset the daemon falls back to `MaxConcurrent`, i.e. one wave of tasks and then the job is done.",
			],
			placeholder: "10",
			cli: "docker service create --mode replicated-job --replicas 10",
		},
	],
};
