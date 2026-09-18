/**
 * The English UI dictionary. This is the source of truth for the message key
 * union: `messages-zh.ts` is checked against it, and `t()` rejects any key that
 * does not exist here.
 *
 * Prose that belongs to the catalog (field titles, summaries, details, caution
 * notes, option hints) lives in `src/i18n/catalog/` instead, and the field guide
 * lives in `src/content/posts.zh.ts`. What stays here is chrome, controls and
 * everything the app says in its own voice.
 *
 * `{{name}}` is the only templating: substitution, nothing else.
 */
export const en = {
	header: {
		brand: "Service Update Builder",
		navBuilder: "Builder",
		navGuide: "Field guide",
		navAbout: "About",
		navApiDocs: "API docs",
		followX: "Follow on X",
		github: "Open project GitHub",
	},
	footer: {
		copyright: "© {{year}} Your name here. All rights reserved.",
		builtWith: "Built with TanStack Start",
	},
	theme: {
		light: "Light",
		dark: "Dark",
		auto: "Auto",
		switchAuto: "Theme: auto (follows the system). Click to switch to light.",
		switch: "Theme: {{mode}}. Click to switch to {{next}}.",
	},
	locale: {
		switch: "Switch to Chinese",
		label: "中文",
		current: "Current language: {{name}}",
	},
	home: {
		title: "Docker Service Update Builder",
		description:
			"Build a Docker Engine API ServiceUpdate object visually and export it as JSON, YAML or curl.",
		kicker: "Docker Engine API {{version}} · ServiceUpdate",
		heading: "Build a service update object you can actually explain.",
		intro:
			"Tick the keys you want to change, in units humans use. Every field carries the reasoning behind it, the CLI flag it maps to, and the Compose key it corresponds to. The result exports as JSON, YAML or a runnable curl script.",
		warningLead: "Read this first.",
		warningBody:
			"`POST /services/{id}/update` replaces the whole ServiceSpec — it is not a patch endpoint. Treat the object below as the *diff* you merge into the spec you read from `GET /services/{id}`. The curl tab shows that flow end to end.",
		apiRef: "Docker Engine API {{version}} — ServiceUpdate reference",
		searchLabel: "Find a field",
		searchDescription:
			"{{fields}} keys across {{sections}} sections. Searching matches JSON keys, paths, CLI flags and Compose keys.",
		searchPlaceholder: "MemoryBytes, rollback, --limit-cpu, deploy.resources…",
	},
	presets: {
		kicker: "Start from a preset",
		heading: "Common update shapes",
		clearAll: "Clear all",
		empty:
			"Or tick any field below. Only the fields you enable end up in the generated object.",
		items: {
			memoryLimit: {
				title: "Raise the memory limit",
				summary:
					"The minimal one-key body: TaskTemplate.Resources.Limits.MemoryBytes.",
				rationale:
					"The smallest useful update body there is. It is also the clearest illustration of why partial specs are dangerous: sent on its own it would erase the image, the environment and every mount, so this object has to be merged into the spec you read back from GET /services/{id}.",
			},
			zeroDowntime: {
				title: "Zero-downtime rollout",
				summary:
					"start-first ordering, a real health check, and automatic rollback when the new version misbehaves.",
				rationale:
					"The combination that makes a deploy invisible to users: one task at a time, the replacement starts before the old one stops, each new task is watched for long enough that a crash-loop is caught, and a failure reverts the service instead of leaving it half-updated.",
			},
			scale: {
				title: "Scale replicas",
				summary: "Change Mode.Replicated.Replicas and nothing else.",
				rationale:
					"Scaling is the cheapest update Swarm knows: the task template is untouched, so no image is pulled and no running task is replaced — Swarm simply starts or stops replicas.",
			},
			forceRedeploy: {
				title: "Force a redeploy",
				summary: "Bump TaskTemplate.ForceUpdate to re-pull a mutable tag.",
				rationale:
					"Swarm only acts when the spec changes. After re-pushing the same tag nothing differs, so the rollout never happens. Incrementing this counter creates a spec difference and the normal UpdateConfig rollout runs.",
			},
			hardened: {
				title: "Hardened container",
				summary:
					"Read-only root, all capabilities dropped, an init process and a non-root user.",
				rationale:
					"The default posture a security review asks for. The tmpfs mount is not optional — a read-only root filesystem breaks almost every image that writes to /tmp during startup.",
			},
			manualRollback: {
				title: "Manual rollback",
				summary:
					"Call the endpoint with ?rollback=previous and let the body be ignored.",
				rationale:
					"The escape hatch when a deploy went out and nobody configured automatic rollback. The daemon restores PreviousSpec; the body is still required by the endpoint but its contents are discarded — which is why the generated JSON here is intentionally almost empty.",
			},
		},
	},
	section: {
		set: "{{count}} set",
		show: "Show",
		hide: "Hide",
	},
	field: {
		unset: "— unset —",
		unit: "Unit",
		serialisesTo: "Serialises to {{value}}",
		empty: "Empty — the key is omitted from the generated object.",
		explain: "What does this do?",
		hideExplanation: "Hide explanation",
		apiDefault: "API default",
		cli: "CLI",
		compose: "Compose",
	},
	rows: {
		addEntry: "Add entry",
		remove: "Remove",
		empty: "No entries yet — the key is omitted from the output.",
		booleanTrue: "true",
		booleanUnset: "unset",
	},
	output: {
		kicker: "Generated object",
		includedOne: "1 field included",
		includedOther: "{{count}} fields included",
		copy: "Copy",
		copied: "Copied",
		copyBlocked: "Copy blocked",
		download: "Download",
		copyPermalink: "Copy permalink",
		jsonHint: "The request body, ready to POST.",
		yamlHint: "The same object, easier to review in a PR.",
		curlHint: "The full read-modify-write flow against the Docker socket.",
		endpoint: "Endpoint: ",
		apiRef: "ServiceUpdate reference",
	},
	review: {
		kicker: "Review",
		empty: "No conflicts detected in the current selection.",
		countOne: "1 thing to check",
		countOther: "{{count}} things to check",
		levelError: "Will be rejected",
		levelWarning: "Likely a mistake",
		levelInfo: "Worth knowing",
	},
	furtherReading: {
		kicker: "Field guide",
		startHere: "Start here",
		forConfigured: "Background for what you have configured",
		loading: "Loading…",
	},
	units: {
		seconds: "seconds",
		minutes: "minutes",
		hours: "hours",
		bytes: "bytes",
		inherit: "0 (inherit / unbounded)",
		coresOne: "{{count}} core",
		coresOther: "{{count}} cores",
		entriesOne: "1 entry",
		entriesOther: "{{count}} entries",
		keys: "{{count}} key(s)",
	},
	curl: {
		readStep: "# 1. Read the current spec and its version index.",
		mergeStep:
			"# 2. Merge the object below into that .Spec (jq '. * $patch' does a deep merge),",
		mergeStep2:
			"#    then POST the merged spec back. Sending the patch on its own would",
		mergeStep3: "#    clear every key you left out.",
	},
	about: {
		title: "About — Docker Service Update Builder",
		kicker: "About",
		heading: "A visual editor for one specific JSON object.",
		intro:
			"The Docker Engine API's `ServiceUpdate` body is deeply nested, unit-free and unforgiving. This builder covers {{fields}} keys across {{sections}} sections of Engine API {{version}}, explains each one in plain language, and exports the result as JSON, YAML or a runnable curl script.",
		howItWorks: "How it works",
		howItWorks1:
			"Every key is described as data in `src/docker/catalog/` — its JSON path, editor type, prose, CLI flag and Compose equivalent. Adding coverage is a data change, never a component change.",
		howItWorks2:
			"Numbers are edited in human units and serialised to the raw scalars the API wants: nanoseconds, bytes and nano-CPUs.",
		howItWorks3:
			"Only the keys you tick are emitted, which is what makes the output a usable diff rather than a whole spec.",
		howItWorks4:
			"A cross-field review flags the combinations the daemon rejects — dnsrr with published ports, start-first with host-mode ports, reservations above limits, and more.",
		howItWorks5:
			"{{count}} presets encode complete, defensible configurations rather than single keys.",
		stack: "Stack",
		scope: "Scope and honesty",
		scopeBody:
			"This app never talks to a Docker daemon. It has no backend, holds no credentials, and cannot apply anything — it produces text you review and run yourself. That is deliberate: the dangerous part of a service update is the merge, and a tool that hides the merge would be worse than no tool.",
		apiRef: "Engine API {{version}} — ServiceUpdate reference",
		guide: "Field guide",
		builder: "Builder",
		stackEntries: {
			start:
				"The framework. SSR and routing only — this app ships no server functions, so the build is deployable as a static SPA.",
			router:
				"File-based routes plus JSON-first search params. The whole builder state round-trips through ?c= as a base64url permalink.",
			store:
				"Holds the field states. Named actions keep the reducer logic out of components; createAtom derives the spec, the YAML and the review findings.",
			query:
				"Loads the field guide through a dynamic import. The route loader primes the cache, the builder page reads the same entry.",
			intent:
				"Ships the library skills that agents load before touching router or Start code. See AGENTS.md.",
			cli: "Scaffolded the project and installed the add-ons.",
			biome: "Formatter and linter. One toolchain, no ESLint or Prettier.",
			i18n: "Cookie-backed locale resolution: the server picks the language for the first paint, the client owns it afterwards.",
		},
	},
	blog: {
		indexTitle: "Field guide — Docker Service Update Builder",
		indexDescription:
			"The mental model behind Docker Swarm service updates: spec replacement, units, rollouts and rollback.",
		kicker: "Field guide",
		heading: "The parts that are not in the schema.",
		intro:
			"The Engine API reference tells you the type of every key. It does not tell you that the endpoint replaces the whole spec, that durations are nanoseconds, or why your rollout is quietly dropping connections. These posts do.",
		minRead: "{{count}} min read",
		byline: "{{date}} · {{count}} min read",
		configureIt: "Configure it",
		configureItBody:
			"Sections of the builder that cover what this post describes:",
		allPosts: "← All posts",
		postTitle: "{{title}} — Field guide",
		notFoundHeading: "No such post",
		notFoundBody: "That slug is not part of the field guide.",
		notFoundLink: "Back to the field guide",
	},
	issues: {
		replicasOnGlobal: {
			title: "Replica count set on a global service",
			detail:
				"Mode is a tagged union — sending both Mode.Global and Mode.Replicated.Replicas produces an invalid spec. Global services always run exactly one task per eligible node.",
		},
		jobOnReplicated: {
			title: "Job settings on a replicated service",
			detail:
				"MaxConcurrent and TotalCompletions live under Mode.ReplicatedJob. Switch the mode kind to 'Replicated job' or drop these fields.",
		},
		portsRequireVip: {
			title: "Published ports require vip endpoint mode",
			detail:
				"The daemon rejects a spec that publishes ports while EndpointSpec.Mode is dnsrr, because there is no virtual IP to route the ingress traffic to.",
		},
		startFirstHostPorts: {
			title: "start-first cannot be used with host-mode ports",
			detail:
				"A start-first rollout runs the old and new task at the same time. Both would try to bind the same port on the node, so the new task fails to start and the rollout stalls.",
		},
		maxFailureRatioRange: {
			title: "{{scope}}.MaxFailureRatio must be between 0 and 1",
			detail:
				"It is a fraction, not a percentage: 20% of tasks is 0.2. Values outside the range are rejected by the daemon.",
		},
		memoryReservationAboveLimit: {
			title: "Memory reservation exceeds the limit",
			detail:
				"The scheduler would reserve more memory than the cgroup allows the task to use. Docker rejects this combination.",
		},
		cpuReservationAboveLimit: {
			title: "CPU reservation exceeds the limit",
			detail:
				"Reserving more cores than the limit permits means the task can never use what was set aside for it.",
		},
		maxAttemptsWithConditionNone: {
			title: "MaxAttempts has no effect with Condition: none",
			detail:
				"Tasks are never restarted, so the attempt counter is ignored. If you meant to bound retries, use Condition: on-failure.",
		},
		mountWithoutTarget: {
			title: "Mount without a Target",
			detail:
				"Every mount needs an absolute container path in Target, otherwise the task cannot be created.",
		},
		tmpfsWithSource: {
			title: "tmpfs mount with a Source",
			detail:
				"Source must be empty for Type=tmpfs — the filesystem is created in memory and has nothing to bind to.",
		},
		bindWithoutConstraint: {
			title: "Bind mount without a placement constraint",
			detail:
				"A bind mount depends on a path existing on one specific node. Without a constraint pinning the service there, rescheduling will land the task on a node where the path is missing.",
		},
		malformedConstraint: {
			title: "Constraint expression is not a match or exclude rule",
			detail:
				"Constraints only support == and !=. Offending line(s): {{lines}}",
		},
		malformedEnv: {
			title: "Environment entry without an '=' separator",
			detail:
				"Env is a list of VAR=value strings. Offending line(s): {{lines}}",
		},
		healthBelowOneMs: {
			title: "Health check duration below 1 ms",
			detail:
				"The Engine API requires these to be either 0 (inherit from the image) or at least 1000000 ns.",
		},
		healthTimeoutNotShorter: {
			title: "Health check timeout is not shorter than the interval",
			detail:
				"Probes will overlap: a new one starts before the previous has been declared failed, which multiplies load on an already struggling task.",
		},
		monitorBeforeStartPeriod: {
			title:
				"Rollout monitor window ends before the health check starts reporting",
			detail:
				"UpdateConfig.Monitor should outlast HealthCheck.StartPeriod plus a couple of intervals, otherwise a task is declared a successful update before its first real probe has run.",
		},
		rollbackWithoutConfig: {
			title: "Automatic rollback enabled without a RollbackConfig",
			detail:
				"The daemon will fall back to its defaults (parallelism 1, no delay, stop-first). Setting RollbackConfig explicitly makes recovery faster and predictable.",
		},
		readOnlyWithoutTmpfs: {
			title: "Read-only root filesystem without a tmpfs mount",
			detail:
				"Most images write to /tmp or a cache directory on startup. Add a tmpfs mount for those paths or the container will fail immediately.",
		},
		rowMissingKey: {
			title: "{{label}} row is missing {{key}}",
			detail:
				"{{key}} is required for every entry; rows without it produce an invalid spec.",
		},
		rowLabels: {
			ulimit: "Ulimit",
			network: "Network attachment",
			secret: "Secret",
			config: "Config",
		},
		missingVersion: {
			title: "No version supplied for the update request",
			detail:
				"`?version=` is a required query parameter. Read Version.Index from GET /services/{id} and send that exact value, otherwise the daemon answers 409 Conflict.",
		},
	},
} as const;

export type UiMessages = typeof en;

/**
 * Structural type only — the Chinese table must have exactly this shape.
 * Widening the literal types (`as const` → `string`) is what lets `zh` hold
 * different text while staying key-complete.
 */
export type UiMessagesShape = {
	[K in keyof UiMessages]: UiMessages[K] extends string
		? string
		: UiMessagesShapeOf<UiMessages[K]>;
};

type UiMessagesShapeOf<T> = {
	[K in keyof T]: T[K] extends string ? string : UiMessagesShapeOf<T[K]>;
};
