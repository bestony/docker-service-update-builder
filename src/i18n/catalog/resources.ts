import type { FieldCopyTable, SectionCopy } from "../field-copy";

/** Chinese copy for `src/docker/catalog/resources.ts`. */

export const resourcesSectionZh: SectionCopy = {
	title: "资源",
	summary: "每个任务的 CPU、内存与 PID 上限——以及调度器用来放置任务的预留。",
	details: [
		"上限（limit）与预留（reservation）回答的是两个不同的问题。*上限*由内核 cgroup 在运行时强制执行：超过内存上限，容器就会被 OOM 杀掉。*预留*只在调度器判断哪个节点还有余量时使用；任务跑起来之后没有任何东西去保障它。",
		"正因为预留决定了能否被调度，过度预留就是你看到 `no suitable node (insufficient resources on N nodes)` 而集群看起来还很空闲的原因。",
		'这一节背后就是那个经典的「一行更新体」：`{"TaskTemplate":{"Resources":{"Limits":{"MemoryBytes":12884901888}}}}`——12 GiB 用字节表示。',
	],
};

export const restartSectionZh: SectionCopy = {
	title: "重启策略",
	summary: "任务退出或崩溃时 Swarm 会做什么。",
	details: [
		"它管的是单个*任务*的失败，与 `UpdateConfig.FailureAction` 是不同机制——后者管的是新任务持续失败时*发布*该怎么办。",
		"重启不会复用旧容器：Swarm 会调度一个全新的任务，它可能落在另一个节点上。",
	],
};

export const placementSectionZh: SectionCopy = {
	title: "调度放置",
	summary: "哪些节点可用，以及任务如何在它们之间分布。",
	details: [
		"约束是硬过滤——匹配不到任何节点的任务会永远停在 Pending。偏好是软性的，只在打平时起作用。",
	],
};

export const resourcesFieldsZh: FieldCopyTable = {
	"limit-memory": {
		title: "内存上限",
		summary: "每个任务的硬内存上限，单位为字节。",
		details: [
			"由 cgroup 强制执行。进程越过上限时内核会 OOM 杀掉容器，Swarm 再按重启策略重启任务——从外面看像一次无法解释的重启循环，所以一定要用 `docker service ps --no-trunc` 检查退出码 137。",
			"API 里没有单位后缀：12 GiB 是 12 * 1024³ = 12884901888。",
		],
		placeholder: "12",
		caution:
			"把内存上限设得低于运行时的堆配置，高负载下必然被 OOM 杀掉。请在 -Xmx / GOMEMLIMIT 之上留出余量。",
	},
	"limit-cpu": {
		title: "CPU 上限",
		summary: "每个任务的硬 CPU 上限，以 nano CPU 表示。",
		details: [
			"一个核心是 1_000_000_000 nano CPU，所以 1.5 核是 1500000000。这个值会变成 CFS 配额：进程被限流，但不会被杀。",
			"限流在大多数监控面板上看不出来，但会表现为延迟尖峰。如果你刚设了 CPU 上限 p99 就变差，原因就在这里。",
		],
		placeholder: "1.5",
	},
	"limit-pids": {
		title: "PID 上限",
		summary: "容器内进程/线程数的最大值。",
		details: [
			"一个廉价的防 fork 炸弹手段。注意线程也计数，所以线程池很大的 JVM 或 Go 程序需要一个宽松的值。",
		],
		apiDefault: "0（不限制）",
		placeholder: "512",
	},
	"reserve-memory": {
		title: "内存预留",
		summary: "调度器在放置任务前必须在某个节点上找到的可用内存。",
		details: [
			"纯粹是调度提示——运行时没有任何东西阻止容器用更多。把它设在接近稳态工作集的位置，而不是接近上限的位置。",
		],
		placeholder: "4",
	},
	"reserve-cpu": {
		title: "CPU 预留",
		summary: "调度器在放置任务前必须在某个节点上找到的可用 CPU。",
		details: [
			"Swarm 会把节点上已有任务的预留累加。连同内存预留一起，这就是 Swarm 全部的资源模型。",
		],
		placeholder: "0.5",
	},
	"generic-resources": {
		title: "通用资源",
		summary: "用户自定义的节点资源，例如按种类申请的 GPU。",
		details: [
			"节点通过守护进程的 `node-generic-resources` 设置来声明这些资源。*discrete* 请求要的是一个数量（`SSD=3`）；*named* 请求要的是某个具体实例（`GPU=UUID1`）。",
			"一行里 discrete 或 named 两组列只填其中一组，绝不要两边都填。",
		],
		columns: [
			{ label: "Discrete kind", hint: "节点声明的资源名称。" },
			{ label: "数量", hint: "这个任务需要该资源的多少个单位。" },
			{
				label: "Named kind",
				hint: "按实例寻址的硬件的资源名称。",
			},
			{ label: "实例", hint: "要绑定的具体实例标识。" },
		],
	},
	"restart-condition": {
		title: "Condition",
		summary: "哪些退出会触发重启。",
		details: [
			"长期运行的服务默认用 `any`。合法地以 0 退出的批处理任务应该用 `on-failure`。`none` 会让死掉的任务一直是死的。",
		],
		options: [
			{
				label: "any",
				hint: "无论退出码如何都重启。服务的默认值。",
			},
			{ label: "on-failure", hint: "只在退出码非零时重启。" },
			{
				label: "none",
				hint: "永不重启；副本数会悄悄下降。",
			},
		],
	},
	"restart-delay": {
		title: "Delay",
		summary: "两次重启尝试之间的等待时间。",
		details: [
			"Swarm 不做指数退避——这个延迟是固定的。太小的话，崩溃循环中的任务会反复冲击镜像仓库和你的日志；5–10 秒是比较稳妥的下限。",
		],
		placeholder: "5",
	},
	"restart-max-attempts": {
		title: "MaxAttempts",
		summary: "在窗口内最多重试多少次后放弃。",
		details: [
			"0 表示不限制。尝试次数是按 `Window` 计数的；不设窗口时，计数器实际上贯穿该任务槽位的整个生命周期。",
		],
		apiDefault: "0（不限制）",
		placeholder: "3",
	},
	"restart-window": {
		title: "Window",
		summary: "对 MaxAttempts 进行计数的时间窗口。",
		details: [
			"没有窗口时，`MaxAttempts` 会永远累加，于是每月重启一次的服务最终也会停止恢复。设置窗口把它变成「T 分钟内失败 N 次」。",
		],
		apiDefault: "0（无界）",
		placeholder: "10",
	},
	constraints: {
		title: "约束",
		summary: "硬性调度过滤条件，每行一个表达式。",
		details: [
			"只有 `==` 和 `!=`，没有 `>`，也没有正则。多行之间是「与」的关系。",
			"可匹配的属性：`node.id`、`node.hostname`、`node.role`、`node.platform.os`、`node.platform.arch`、`node.labels.<key>` 以及 `engine.labels.<key>`。",
		],
		placeholder: "node.role==worker\nnode.labels.tier==production",
		caution:
			"没有任何节点满足的约束会让任务以 `no suitable node` 停在 Pending，而旧任务继续运行——于是这次更新永远不会完成，也永远不会报错。",
	},
	preferences: {
		title: "偏好（分散）",
		summary: "软性的分散规则，按列出顺序依次应用。",
		details: [
			"每一行会把任务均匀分散到某个节点标签的各个取值上——这是在多个可用区或机架之间均衡副本的标准做法。",
		],
		columns: [
			{
				label: "分散描述符",
				hint: "按它的取值来分散任务的标签。",
			},
		],
	},
	"max-replicas": {
		title: "每节点最大副本数",
		summary: "限制这个服务有多少任务可以共用一台节点。",
		details: [
			"设为 1 可以保证单台节点宕机永远不会同时带走两个副本。如果副本数高于节点数，这会让任务停在 Pending——通常这正是你希望被注意到的结果。",
		],
		apiDefault: "0（不限制）",
		placeholder: "1",
	},
	platforms: {
		title: "平台",
		summary: "镜像可运行的架构/操作系统，用作调度过滤条件。",
		details: [
			"通常由镜像 manifest 自动填充。只有在多架构集群里想把服务钉在某个架构上时才手动设置。",
		],
		columns: [
			{ label: "架构", hint: "硬件架构，例如 amd64 或 arm64。" },
			{ label: "操作系统", hint: "操作系统，例如 linux 或 windows。" },
		],
	},
};
