/**
 * Long-form companion to the builder.
 *
 * The generator explains individual keys; these posts explain the mental model
 * you need before those keys make sense. Content is structured data rather than
 * markdown so the app stays dependency-free and the blocks stay type-checked.
 */

export type PostBlock =
	| { kind: "p"; text: string }
	| { kind: "h"; text: string }
	| { kind: "ul"; items: Array<string> }
	| { kind: "code"; language: string; code: string }
	| { kind: "note"; text: string };

export interface Post {
	slug: string;
	title: string;
	summary: string;
	date: string;
	readingMinutes: number;
	tags: Array<string>;
	/** Catalog section ids this post explains, used for cross-linking. */
	sections: Array<string>;
	blocks: Array<PostBlock>;
}

export const posts: Array<Post> = [
	{
		slug: "partial-service-spec-is-a-trap",
		title: "A partial ServiceSpec is a trap",
		summary:
			'Why {"TaskTemplate":{"Resources":{"Limits":{"MemoryBytes":12884901888}}}} deletes your image, and what to send instead.',
		date: "2026-08-05",
		readingMinutes: 6,
		tags: ["ServiceUpdate", "semantics"],
		sections: ["resources", "request"],
		blocks: [
			{
				kind: "p",
				text: "Almost every Docker Swarm tutorial shows a one-line update body. It looks like a patch. It is not a patch.",
			},
			{
				kind: "code",
				language: "json",
				code: '{\n  "TaskTemplate": {\n    "Resources": {\n      "Limits": { "MemoryBytes": 12884901888 }\n    }\n  }\n}',
			},
			{
				kind: "p",
				text: "POST that to /services/{id}/update and the daemon does exactly what you asked: it replaces the entire ServiceSpec with the object you sent. The image is gone. The environment is gone. Every mount, port, secret and placement constraint is gone. Swarm then tries to reconcile a service with no image and the tasks fail to start.",
			},
			{ kind: "h", text: "The endpoint is read-modify-write" },
			{
				kind: "p",
				text: "ServiceUpdate takes a complete desired state, not a diff. The supported flow has three steps, and the middle one is the one people skip.",
			},
			{
				kind: "ul",
				items: [
					"GET /services/{id} — read the current .Spec and the .Version.Index.",
					"Merge your change into that spec locally.",
					"POST the merged spec back with ?version=<the index you just read>.",
				],
			},
			{
				kind: "code",
				language: "bash",
				code: "current=$(curl -s --unix-socket /var/run/docker.sock \\\n  http://localhost/v1.43/services/api-gateway)\n\nversion=$(echo \"$current\" | jq '.Version.Index')\n\necho \"$current\" | jq '.Spec * {\n  TaskTemplate: { Resources: { Limits: { MemoryBytes: 12884901888 } } }\n}' | curl -s -X POST --unix-socket /var/run/docker.sock \\\n  -H 'Content-Type: application/json' \\\n  \"http://localhost/v1.43/services/api-gateway/update?version=$version\" \\\n  --data-binary @-",
			},
			{
				kind: "note",
				text: "jq's `*` operator deep-merges objects, which is exactly the semantics you want here. Note that it merges objects but replaces arrays — Env, Mounts and Ports are all arrays, so a partial list still wipes the rest.",
			},
			{ kind: "h", text: "Why the version parameter exists" },
			{
				kind: "p",
				text: "Because the write is a full replacement, two concurrent updates would silently clobber each other. The version index is an optimistic-concurrency token: send the value you read, and if anything changed in between the daemon answers 409 Conflict instead of applying your stale spec.",
			},
			{
				kind: "p",
				text: "This is why the CLI feels safer than raw curl. `docker service update --limit-memory 12g` performs the read, the merge and the version handshake for you. The API gives you the primitives, not the workflow.",
			},
			{ kind: "h", text: "So what is this builder for?" },
			{
				kind: "p",
				text: "The generated object is the diff — the part you write by hand and then merge. Getting the shape, the nesting and the units right is the fiddly bit; the merge is one jq expression. The curl tab shows both halves together so the merge never gets forgotten.",
			},
		],
	},
	{
		slug: "reading-docker-units",
		title: "Nanoseconds, nano-CPUs and raw bytes",
		summary:
			"The Engine API has no unit suffixes. Here is how every numeric field converts, and where the rounding bites.",
		date: "2026-08-05",
		readingMinutes: 4,
		tags: ["units", "resources"],
		sections: ["resources", "update-config", "health"],
		blocks: [
			{
				kind: "p",
				text: "The Docker CLI accepts `12g`, `30s` and `1.5` for cores. The Engine API accepts none of them. Every numeric field is a bare integer in a fixed base unit, and the base unit is different per field family.",
			},
			{
				kind: "ul",
				items: [
					"Durations — nanoseconds. 30s is 30000000000. This covers UpdateConfig.Delay, Monitor, RestartPolicy.Delay and Window, StopGracePeriod and every HealthCheck timing.",
					"Memory — bytes, binary multiples. 12 GiB is 12 * 1024^3 = 12884901888. Note that `docker service update --limit-memory 12g` also means GiB, not GB.",
					"CPU — nano CPUs. One core is 1000000000, so 1.5 cores is 1500000000.",
					"File modes — decimal, not octal. A secret mounted 0444 is written as 292.",
					"MaxFailureRatio — a float between 0 and 1. 20% is 0.2, not 20.",
				],
			},
			{ kind: "h", text: "Where this goes wrong" },
			{
				kind: "p",
				text: "Two failure modes show up repeatedly. The first is writing 12000000000 for 12 GiB — a decimal-vs-binary slip that silently gives you 11.18 GiB and an OOM kill under peak load. The second is writing 30 for a duration: 30 nanoseconds is not rejected, it is accepted as a valid, absurdly small value.",
			},
			{
				kind: "note",
				text: "Health check durations are the exception that does validate: they must be 0 or at least 1000000 ns (1 ms). 0 means 'inherit from the image', which is not the same as 'disabled'.",
			},
			{ kind: "h", text: "Reading the values back" },
			{
				kind: "p",
				text: "`docker service inspect` prints the raw scalars too, so the same conversion applies in reverse when you are diffing what is deployed against what you meant to deploy. This is a good reason to keep the generated object in version control: the numbers are unreadable, but a diff of them is not.",
			},
		],
	},
	{
		slug: "zero-downtime-rollouts",
		title: "What actually makes a rollout zero-downtime",
		summary:
			"UpdateConfig, health checks and stop grace periods are one mechanism. Setting only one of them buys you nothing.",
		date: "2026-08-05",
		readingMinutes: 7,
		tags: ["UpdateConfig", "rollout"],
		sections: ["update-config", "health", "container"],
		blocks: [
			{
				kind: "p",
				text: "Swarm replaces tasks in waves. Understanding the wave is the whole game: for each task, it starts (or stops) the replacement, waits for the Monitor window, counts failures, and then either continues after Delay or triggers FailureAction.",
			},
			{ kind: "h", text: "Order: the one setting people miss" },
			{
				kind: "p",
				text: "The default is `stop-first`: the old task is killed, then the new one starts. Between those two events the replica does not exist. With one replica that is a hard outage; with several it is a capacity dip plus whatever the routing mesh does with in-flight connections.",
			},
			{
				kind: "p",
				text: "`start-first` inverts it — the new task must be running before the old one is signalled. That is the only ordering that can be genuinely zero-downtime. It costs you transient double capacity, and it is incompatible with host-mode published ports because both tasks would fight for the same port on the node.",
			},
			{ kind: "h", text: "Running is not the same as ready" },
			{
				kind: "p",
				text: "Without a health check, Swarm considers a task successful the moment the container process starts. A service that boots, connects to nothing, and exits three seconds later still counts as a successful replacement for the first few seconds — long enough for the next wave to go out.",
			},
			{
				kind: "p",
				text: "A health check turns 'the process started' into 'the process answers'. Then Monitor becomes meaningful: it is the window during which a task must stay healthy to count as a good replacement.",
			},
			{
				kind: "code",
				language: "json",
				code: '{\n  "UpdateConfig": {\n    "Parallelism": 1,\n    "Delay": 10000000000,\n    "Monitor": 60000000000,\n    "FailureAction": "rollback",\n    "MaxFailureRatio": 0,\n    "Order": "start-first"\n  }\n}',
			},
			{ kind: "h", text: "Draining, not dropping" },
			{
				kind: "p",
				text: "The last piece is the shutdown side. StopSignal reaches PID 1, and StopGracePeriod is how long your process has before SIGKILL. Two things break this in practice: an entrypoint shell script that does not forward signals (fix with Init), and a grace period shorter than your longest request (fix by raising it above your p99 plus the connection drain).",
			},
			{
				kind: "ul",
				items: [
					"Order: start-first — never fewer replicas than you started with.",
					"HealthCheck with a realistic StartPeriod — readiness, not liveness.",
					"Monitor longer than StartPeriod plus a couple of intervals.",
					"FailureAction: rollback — recover without a human in the loop.",
					"Init plus a StopGracePeriod above your p99 — no dropped connections on the way out.",
				],
			},
			{
				kind: "note",
				text: "UpdateConfig is stored on the service, not on the request. Setting it once applies to every future update, including the automatic ones triggered by a rollback.",
			},
		],
	},
	{
		slug: "rollback-mechanics",
		title: "Rollback: one spec deep, and that is on purpose",
		summary:
			"Swarm keeps exactly one PreviousSpec. What that means for automatic rollback, manual rollback and registry credentials.",
		date: "2026-08-05",
		readingMinutes: 5,
		tags: ["RollbackConfig", "operations"],
		sections: ["rollback-config", "request"],
		blocks: [
			{
				kind: "p",
				text: "Every service object carries a Spec and a PreviousSpec. There is no third slot. A rollback swaps them, so rolling back twice in a row just toggles between the last two versions — it does not walk further back in history.",
			},
			{ kind: "h", text: "Two ways to trigger it" },
			{
				kind: "p",
				text: "Automatically, by setting UpdateConfig.FailureAction to `rollback`: when enough updated tasks fail inside their Monitor window, the daemon reverts without anyone being paged. Manually, by calling the update endpoint with ?rollback=previous — the request body is still required by the endpoint but its contents are ignored entirely.",
			},
			{
				kind: "code",
				language: "bash",
				code: "curl -s -X POST --unix-socket /var/run/docker.sock \\\n  -H 'Content-Type: application/json' \\\n  'http://localhost/v1.43/services/api-gateway/update?version=43&rollback=previous&registryAuthFrom=previous-spec' \\\n  -d '{}'",
			},
			{ kind: "h", text: "The registryAuthFrom footgun" },
			{
				kind: "p",
				text: "Registry credentials are attached to a spec. During a rollback the credentials you want are the ones that worked for the old image, which live in the previous spec — hence `registryAuthFrom=previous-spec`. Leave it at the default `spec` and a rollback to a private image can fail to pull on exactly the nodes you need it on.",
			},
			{ kind: "h", text: "Tune RollbackConfig differently from UpdateConfig" },
			{
				kind: "p",
				text: "A rollout should be cautious; a rollback should be quick. The service is already broken, so a higher Parallelism and a shorter Delay are usually right. Keep Order consistent with the rollout, though: a stop-first rollback still means a gap in capacity while the known-good version comes back.",
			},
			{
				kind: "note",
				text: "RollbackConfig.FailureAction only accepts `continue` and `pause`. There is nothing left to roll back to, so `rollback` is not a legal value there.",
			},
		],
	},
];
