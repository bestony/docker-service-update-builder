import type { FieldDef, SectionDef } from "../field-types";

const ORDER_OPTIONS = [
	{
		value: "stop-first",
		label: "stop-first",
		hint: "Kill the old task, then start the new one. Safe for singletons holding an exclusive resource.",
	},
	{
		value: "start-first",
		label: "start-first",
		hint: "Start the new task before killing the old one. Required for zero downtime, needs spare capacity.",
	},
];

function orderField(prefix: "UpdateConfig" | "RollbackConfig"): FieldDef {
	const rolling = prefix === "UpdateConfig";
	return {
		id: `${prefix.toLowerCase()}-order`,
		path: `${prefix}.Order`,
		key: "Order",
		type: "select",
		title: "Order",
		summary:
			"Whether the replacement task starts before or after the old one stops.",
		details: [
			rolling
				? "`start-first` is the only way to get a genuinely zero-downtime rollout, because there is always at least one healthy task serving traffic. The cost is that the node briefly runs both tasks, so you need spare CPU, memory and — crucially — no exclusive host port."
				: "Mirror whatever you chose for the update. A `stop-first` rollback on a broken service means a short outage while the good version comes back.",
			"With `stop-first` the routing mesh removes the old task before the new one is ready, so requests are refused for the duration of the container start plus health-check warm-up.",
		],
		options: ORDER_OPTIONS,
		apiDefault: "stop-first",
		cli: `docker service update --${rolling ? "update" : "rollback"}-order start-first`,
		compose: `services.<key>.deploy.${rolling ? "update_config" : "rollback_config"}.order`,
		...(rolling
			? {
					caution:
						"start-first cannot work with a published host-mode port: the two tasks would fight over the same port on the node.",
				}
			: {}),
	};
}

export const updateConfigSection: SectionDef = {
	id: "update-config",
	title: "Update config (rollout strategy)",
	path: "UpdateConfig",
	summary:
		"How Swarm replaces old tasks with new ones — batch size, pacing, and what to do when the new version fails.",
	details: [
		"This is the difference between a deploy nobody notices and a five-minute outage. `UpdateConfig` is stored on the service, so it applies to *every* future update, not just the one you are sending now.",
		"A rollout proceeds in waves of `Parallelism` tasks. After each task starts, Swarm watches it for `Monitor`; if it dies inside that window the task counts as failed. Once the failed fraction exceeds `MaxFailureRatio`, `FailureAction` decides what happens.",
	],
	fields: [
		{
			id: "update-parallelism",
			path: "UpdateConfig.Parallelism",
			key: "Parallelism",
			type: "number",
			title: "Parallelism",
			summary: "How many tasks are updated in one wave.",
			details: [
				"1 is the safest and the slowest: a 50-replica service takes 50 waves. Raising it shortens the rollout but also widens the blast radius of a bad image.",
				"0 means unlimited — every task is replaced at once, which is effectively a restart of the whole service.",
			],
			placeholder: "1",
			cli: "docker service update --update-parallelism 1",
			compose: "services.<key>.deploy.update_config.parallelism",
			caution:
				"Parallelism: 0 replaces every replica simultaneously. Rarely what you want.",
		},
		{
			id: "update-delay",
			path: "UpdateConfig.Delay",
			key: "Delay",
			type: "duration",
			title: "Delay",
			summary: "Pause between two waves of the rollout.",
			details: [
				"The soak time that lets you notice a regression before the next batch goes out. It also gives connection pools and caches time to warm up.",
				"Delay and Monitor are independent: Delay paces the waves, Monitor decides how long a task must survive to be considered good.",
			],
			defaultUnit: "s",
			placeholder: "10",
			cli: "docker service update --update-delay 10s",
			compose: "services.<key>.deploy.update_config.delay",
		},
		{
			id: "update-failure-action",
			path: "UpdateConfig.FailureAction",
			key: "FailureAction",
			type: "select",
			title: "Failure action",
			summary: "What to do once too many updated tasks have failed.",
			details: [
				"`rollback` is the setting most clusters should be running. Without it a bad deploy leaves the service half-updated and paused until a human notices.",
				"`pause` (the Engine default) stops the rollout in place, keeping a mix of old and new tasks alive.",
			],
			options: [
				{
					value: "continue",
					label: "continue",
					hint: "Keep rolling out regardless. Only sensible when tasks are expected to churn.",
				},
				{
					value: "pause",
					label: "pause",
					hint: "Freeze the rollout mid-flight and wait for a human. The Engine default.",
				},
				{
					value: "rollback",
					label: "rollback",
					hint: "Automatically revert to the previous spec using RollbackConfig.",
				},
			],
			apiDefault: "pause",
			cli: "docker service update --update-failure-action rollback",
			compose: "services.<key>.deploy.update_config.failure_action",
		},
		{
			id: "update-monitor",
			path: "UpdateConfig.Monitor",
			key: "Monitor",
			type: "duration",
			title: "Monitor",
			summary: "How long each updated task is watched for failure.",
			details: [
				"A task that dies inside this window counts against `MaxFailureRatio`; one that survives it is declared a success and the rollout moves on.",
				"Set it longer than your health check's start period plus a couple of intervals, otherwise a slow-booting service is declared healthy before it has answered a single probe.",
			],
			defaultUnit: "s",
			placeholder: "30",
			cli: "docker service update --update-monitor 30s",
			compose: "services.<key>.deploy.update_config.monitor",
		},
		{
			id: "update-max-failure-ratio",
			path: "UpdateConfig.MaxFailureRatio",
			key: "MaxFailureRatio",
			type: "text",
			title: "Max failure ratio",
			summary: "Fraction of tasks allowed to fail before FailureAction fires.",
			details: [
				"A float between 0 and 1, not a percentage. 0 means the very first failure triggers the failure action; 0.2 tolerates one bad task in five.",
			],
			apiDefault: "0",
			placeholder: "0.2",
			cli: "docker service update --update-max-failure-ratio 0.2",
			compose: "services.<key>.deploy.update_config.max_failure_ratio",
		},
		orderField("UpdateConfig"),
	],
};

export const rollbackConfigSection: SectionDef = {
	id: "rollback-config",
	title: "Rollback config",
	path: "RollbackConfig",
	summary:
		"The same knobs, applied when Swarm reverts to the previous spec instead of rolling forward.",
	details: [
		"Every service keeps exactly one `PreviousSpec`. A rollback swaps the current spec for it — there is no deeper history, so two rollbacks in a row just toggle between the last two versions.",
		"A rollback can be triggered automatically by `UpdateConfig.FailureAction: rollback`, or manually by calling the update endpoint with `?rollback=previous` (see the Request options section).",
	],
	fields: [
		{
			id: "rollback-parallelism",
			path: "RollbackConfig.Parallelism",
			key: "Parallelism",
			type: "number",
			title: "Parallelism",
			summary: "How many tasks are rolled back in one wave.",
			details: [
				"Rollbacks usually want a *higher* parallelism than rollouts: the service is already broken, so speed matters more than caution.",
			],
			placeholder: "2",
			cli: "docker service update --rollback-parallelism 2",
			compose: "services.<key>.deploy.rollback_config.parallelism",
		},
		{
			id: "rollback-delay",
			path: "RollbackConfig.Delay",
			key: "Delay",
			type: "duration",
			title: "Delay",
			summary: "Pause between two waves of the rollback.",
			details: [
				"Keep it short — every second here is downtime on a broken deploy.",
			],
			defaultUnit: "s",
			placeholder: "5",
			cli: "docker service update --rollback-delay 5s",
			compose: "services.<key>.deploy.rollback_config.delay",
		},
		{
			id: "rollback-failure-action",
			path: "RollbackConfig.FailureAction",
			key: "FailureAction",
			type: "select",
			title: "Failure action",
			summary: "What to do if the rollback itself starts failing.",
			details: [
				"Only `continue` and `pause` are legal here — there is nothing further to roll back to, so `rollback` is not an option.",
			],
			options: [
				{
					value: "continue",
					label: "continue",
					hint: "Push the old spec out anyway.",
				},
				{
					value: "pause",
					label: "pause",
					hint: "Stop and wait for a human. The Engine default.",
				},
			],
			apiDefault: "pause",
			cli: "docker service update --rollback-failure-action pause",
			compose: "services.<key>.deploy.rollback_config.failure_action",
		},
		{
			id: "rollback-monitor",
			path: "RollbackConfig.Monitor",
			key: "Monitor",
			type: "duration",
			title: "Monitor",
			summary: "How long each rolled-back task is watched for failure.",
			details: [
				"Same semantics as the update monitor, applied to the tasks created by the rollback.",
			],
			defaultUnit: "s",
			placeholder: "20",
			cli: "docker service update --rollback-monitor 20s",
			compose: "services.<key>.deploy.rollback_config.monitor",
		},
		{
			id: "rollback-max-failure-ratio",
			path: "RollbackConfig.MaxFailureRatio",
			key: "MaxFailureRatio",
			type: "text",
			title: "Max failure ratio",
			summary: "Fraction of tasks allowed to fail during a rollback.",
			details: [
				"Usually set higher than the update ratio: you would rather finish restoring the known-good version than stall halfway.",
			],
			apiDefault: "0",
			placeholder: "0.5",
			cli: "docker service update --rollback-max-failure-ratio 0.5",
			compose: "services.<key>.deploy.rollback_config.max_failure_ratio",
		},
		orderField("RollbackConfig"),
	],
};
