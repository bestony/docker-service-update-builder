import type { SectionDef } from "../field-types";

const RESOURCES_PATH = "TaskTemplate.Resources";

export const resourcesSection: SectionDef = {
	id: "resources",
	title: "Resources",
	path: RESOURCES_PATH,
	summary:
		"CPU, memory and PID ceilings for every task — and the reservation the scheduler uses to place them.",
	details: [
		"Limits and reservations answer two different questions. A *limit* is enforced by the kernel cgroup at runtime: exceed the memory limit and the container is OOM-killed. A *reservation* is only used by the scheduler when it decides which node has room; nothing enforces it once the task is running.",
		"Because reservations gate placement, over-reserving is how you end up with `no suitable node (insufficient resources on N nodes)` while your cluster looks half idle.",
		'This is the section behind the canonical one-line update body: `{"TaskTemplate":{"Resources":{"Limits":{"MemoryBytes":12884901888}}}}` — 12 GiB expressed in bytes.',
	],
	fields: [
		{
			id: "limit-memory",
			path: `${RESOURCES_PATH}.Limits.MemoryBytes`,
			key: "MemoryBytes",
			type: "bytes",
			title: "Memory limit",
			summary: "Hard memory ceiling per task, in bytes.",
			details: [
				"Enforced by the cgroup. When the process crosses it the kernel OOM-kills the container and Swarm restarts the task according to the restart policy — from the outside this looks like an unexplained restart loop, so always check `docker service ps --no-trunc` for exit code 137.",
				"There is no unit suffix in the API: 12 GiB is 12 * 1024³ = 12884901888.",
			],
			defaultUnit: "GiB",
			placeholder: "12",
			cli: "docker service update --limit-memory 12g",
			compose: "services.<key>.deploy.resources.limits.memory",
			caution:
				"Setting a memory limit below the runtime's heap configuration guarantees an OOM kill under load. Leave headroom above -Xmx / GOMEMLIMIT.",
		},
		{
			id: "limit-cpu",
			path: `${RESOURCES_PATH}.Limits.NanoCPUs`,
			key: "NanoCPUs",
			type: "cpu",
			title: "CPU limit",
			summary: "Hard CPU ceiling per task, expressed in nano CPUs.",
			details: [
				"One core is 1_000_000_000 nano CPUs, so 1.5 cores is 1500000000. The value becomes a CFS quota: the process is throttled, never killed.",
				"Throttling is invisible in most dashboards but shows up as latency spikes. If p99 gets worse right after you set a CPU limit, this is why.",
			],
			placeholder: "1.5",
			cli: "docker service update --limit-cpu 1.5",
			compose: "services.<key>.deploy.resources.limits.cpus",
		},
		{
			id: "limit-pids",
			path: `${RESOURCES_PATH}.Limits.Pids`,
			key: "Pids",
			type: "number",
			title: "PID limit",
			summary: "Maximum number of processes/threads inside the container.",
			details: [
				"A cheap fork-bomb guard. Note that threads count too, so a JVM or a Go binary with a large thread pool needs a generous value.",
			],
			apiDefault: "0 (unlimited)",
			placeholder: "512",
			cli: "docker service update --limit-pids 512",
			compose: "services.<key>.deploy.resources.limits.pids",
		},
		{
			id: "reserve-memory",
			path: `${RESOURCES_PATH}.Reservations.MemoryBytes`,
			key: "MemoryBytes",
			type: "bytes",
			title: "Memory reservation",
			summary:
				"Memory the scheduler must find free on a node before placing a task.",
			details: [
				"Purely a placement hint — nothing stops the container using more at runtime. Set it near the steady-state working set, not near the limit.",
			],
			defaultUnit: "GiB",
			placeholder: "4",
			cli: "docker service update --reserve-memory 4g",
			compose: "services.<key>.deploy.resources.reservations.memory",
		},
		{
			id: "reserve-cpu",
			path: `${RESOURCES_PATH}.Reservations.NanoCPUs`,
			key: "NanoCPUs",
			type: "cpu",
			title: "CPU reservation",
			summary:
				"CPU the scheduler must find free on a node before placing a task.",
			details: [
				"Swarm sums reservations across every task already on a node. Together with the memory reservation this is the only capacity model Swarm has.",
			],
			placeholder: "0.5",
			cli: "docker service update --reserve-cpu 0.5",
			compose: "services.<key>.deploy.resources.reservations.cpus",
		},
		{
			id: "generic-resources",
			path: `${RESOURCES_PATH}.Reservations.GenericResources`,
			key: "GenericResources",
			type: "rows",
			title: "Generic resources",
			summary: "User-defined node resources such as GPUs, requested by kind.",
			details: [
				"Nodes advertise these via the daemon's `node-generic-resources` setting. A *discrete* request asks for a count (`SSD=3`); a *named* request asks for a specific instance (`GPU=UUID1`).",
				"Fill in either the discrete or the named columns for a row, never both.",
			],
			columns: [
				{
					key: "DiscreteResourceSpec.Kind",
					label: "Discrete kind",
					type: "text",
					placeholder: "SSD",
					hint: "Resource name advertised by the node.",
				},
				{
					key: "DiscreteResourceSpec.Value",
					label: "Count",
					type: "number",
					placeholder: "3",
					width: "w-24",
					hint: "How many units of that resource this task needs.",
				},
				{
					key: "NamedResourceSpec.Kind",
					label: "Named kind",
					type: "text",
					placeholder: "GPU",
					hint: "Resource name for instance-addressed hardware.",
				},
				{
					key: "NamedResourceSpec.Value",
					label: "Instance",
					type: "text",
					placeholder: "UUID1",
					hint: "The specific instance identifier to bind.",
				},
			],
			cli: "docker service create --generic-resource 'GPU=2'",
			compose: "services.<key>.deploy.resources.reservations.generic_resources",
		},
	],
};

export const restartSection: SectionDef = {
	id: "restart",
	title: "Restart policy",
	path: "TaskTemplate.RestartPolicy",
	summary: "What Swarm does when a task exits or dies.",
	details: [
		"This governs individual *task* failures, which is a different mechanism from `UpdateConfig.FailureAction` — that one governs what a *rollout* does when new tasks keep failing.",
		"Restarts do not reuse the old container: Swarm schedules a brand new task, which may land on a different node.",
	],
	fields: [
		{
			id: "restart-condition",
			path: "TaskTemplate.RestartPolicy.Condition",
			key: "Condition",
			type: "select",
			title: "Condition",
			summary: "Which exits trigger a restart.",
			details: [
				"`any` is the default for long-running services. `on-failure` is right for batch work that legitimately exits 0. `none` leaves dead tasks dead.",
			],
			options: [
				{
					value: "any",
					label: "any",
					hint: "Restart on every exit, clean or not. The default for services.",
				},
				{
					value: "on-failure",
					label: "on-failure",
					hint: "Restart only on a non-zero exit code.",
				},
				{
					value: "none",
					label: "none",
					hint: "Never restart; the replica count silently drops.",
				},
			],
			cli: "docker service update --restart-condition on-failure",
			compose: "services.<key>.deploy.restart_policy.condition",
		},
		{
			id: "restart-delay",
			path: "TaskTemplate.RestartPolicy.Delay",
			key: "Delay",
			type: "duration",
			title: "Delay",
			summary: "Wait time between restart attempts.",
			details: [
				"Swarm does not back off exponentially — this delay is fixed. Too small and a crash-looping task hammers the registry and your logs; 5–10 s is a sane floor.",
			],
			defaultUnit: "s",
			placeholder: "5",
			cli: "docker service update --restart-delay 5s",
			compose: "services.<key>.deploy.restart_policy.delay",
		},
		{
			id: "restart-max-attempts",
			path: "TaskTemplate.RestartPolicy.MaxAttempts",
			key: "MaxAttempts",
			type: "number",
			title: "Max attempts",
			summary: "How many times to retry before giving up, within the window.",
			details: [
				"0 means unlimited. Attempts are counted per `Window`; with no window the counter is effectively for the lifetime of the task slot.",
			],
			apiDefault: "0 (unlimited)",
			placeholder: "3",
			cli: "docker service update --restart-max-attempts 3",
			compose: "services.<key>.deploy.restart_policy.max_attempts",
		},
		{
			id: "restart-window",
			path: "TaskTemplate.RestartPolicy.Window",
			key: "Window",
			type: "duration",
			title: "Window",
			summary: "The time window in which MaxAttempts is evaluated.",
			details: [
				"Without a window, `MaxAttempts` counts forever and a service that restarts once a month eventually stops recovering. Setting a window turns it into 'N failures in T minutes'.",
			],
			apiDefault: "0 (unbounded)",
			defaultUnit: "m",
			placeholder: "10",
			cli: "docker service update --restart-window 10m",
			compose: "services.<key>.deploy.restart_policy.window",
		},
	],
};

export const placementSection: SectionDef = {
	id: "placement",
	title: "Placement",
	path: "TaskTemplate.Placement",
	summary: "Which nodes are eligible, and how tasks are spread across them.",
	details: [
		"Constraints are hard filters — a task that matches nothing stays Pending forever. Preferences are soft and only break ties.",
	],
	fields: [
		{
			id: "constraints",
			path: "TaskTemplate.Placement.Constraints",
			key: "Constraints",
			type: "lines",
			title: "Constraints",
			summary: "Hard placement filters, one expression per line.",
			details: [
				"Only `==` and `!=` exist; there is no `>` or regex. Multiple lines are ANDed together.",
				"Matchable attributes: `node.id`, `node.hostname`, `node.role`, `node.platform.os`, `node.platform.arch`, `node.labels.<key>` and `engine.labels.<key>`.",
			],
			placeholder: "node.role==worker\nnode.labels.tier==production",
			cli: "docker service update --constraint-add node.role==worker",
			compose: "services.<key>.deploy.placement.constraints",
			lineHint: "constraint",
			caution:
				"A constraint no node satisfies leaves tasks in Pending with `no suitable node`, and the old tasks keep running — the update never completes and never errors.",
		},
		{
			id: "preferences",
			path: "TaskTemplate.Placement.Preferences",
			key: "Preferences",
			type: "rows",
			title: "Preferences (spread)",
			summary: "Soft spreading rules, applied in the order listed.",
			details: [
				"Each row spreads tasks evenly over the distinct values of a node label — the standard way to balance replicas across availability zones or racks.",
			],
			columns: [
				{
					key: "Spread.SpreadDescriptor",
					label: "Spread descriptor",
					type: "text",
					placeholder: "node.labels.datacenter",
					hint: "The label whose values tasks are spread over.",
				},
			],
			cli: "docker service update --placement-pref-add 'spread=node.labels.datacenter'",
			compose: "services.<key>.deploy.placement.preferences",
		},
		{
			id: "max-replicas",
			path: "TaskTemplate.Placement.MaxReplicas",
			key: "MaxReplicas",
			type: "number",
			title: "Max replicas per node",
			summary: "Caps how many tasks of this service may share one node.",
			details: [
				"Set it to 1 to guarantee that losing a node never takes out two replicas at once. Combined with a replica count higher than the node count this will leave tasks Pending, which is usually what you want to notice.",
			],
			apiDefault: "0 (unlimited)",
			placeholder: "1",
			cli: "docker service update --replicas-max-per-node 1",
			compose: "services.<key>.deploy.placement.max_replicas_per_node",
		},
		{
			id: "platforms",
			path: "TaskTemplate.Placement.Platforms",
			key: "Platforms",
			type: "rows",
			title: "Platforms",
			summary:
				"Architectures/OSes the image can run on, used as a scheduling filter.",
			details: [
				"Normally populated automatically from the image manifest. Set it by hand only for multi-arch clusters where you want to pin a service to one architecture.",
			],
			columns: [
				{
					key: "Architecture",
					label: "Architecture",
					type: "text",
					placeholder: "amd64",
					hint: "Hardware architecture, e.g. amd64 or arm64.",
				},
				{
					key: "OS",
					label: "OS",
					type: "text",
					placeholder: "linux",
					hint: "Operating system, e.g. linux or windows.",
				},
			],
		},
	],
};
