import type { FieldCopyTable, SectionCopy } from "../field-copy";

/**
 * Chinese copy for `src/docker/catalog/service.ts`. Field ids and section ids
 * are the map keys, so a rename in the catalog shows up here as a stale entry
 * that `scripts/check-i18n.ts` fails on.
 */

export const serviceSectionZh: SectionCopy = {
	title: "服务标识",
	summary: "ServiceSpec 请求体的顶层键——服务名称与其元数据。",
	details: [
		"它们位于你 POST 到 /services/{id}/update 的 JSON 根部。守护进程在每次更新时都要求 `Name`：漏掉它正是服务被意外重命名成空字符串的原因。",
	],
};

export const modeSectionZh: SectionCopy = {
	title: "调度模式",
	summary:
		"Swarm 运行多少个任务、以及在哪里运行——replicated、每节点一个，还是一次性任务。",
	details: [
		"`Mode` 是标签联合体：`Replicated`、`Global`、`ReplicatedJob`、`GlobalJob` 四者中只能出现一个。把运行中的服务在 replicated 与 global 之间切换会被守护进程拒绝——必须删除后重建。",
	],
};

export const serviceFieldsZh: FieldCopyTable = {
	name: {
		title: "服务名称",
		summary: "服务的名称。",
		details: [
			"守护进程把更新体当作完整的期望状态，所以即使你只想改别的东西，`Name` 也必须提供。除非你确实想重命名服务，否则请保持它与当前名称一致。",
			"重命名服务是允许的，但不会重建它的任务；已接入的 overlay 网络上的 DNS 记录会跟随新名称。",
		],
		placeholder: "api-gateway",
		caution:
			"在更新体里漏掉 Name 是 `rpc error: code = InvalidArgument desc = name must be valid` 的常见原因。",
	},
	labels: {
		title: "服务标签",
		summary: "挂在服务对象上的自定义键值元数据。",
		details: [
			"服务标签在服务上，不在容器上——用它记录归属、成本中心或路由元数据，Traefik 之类的工具会通过 Swarm API 读取这些标签。",
			"更新时标签是整体替换的。你在这里没写到的条目会从服务上被删除。",
		],
		placeholder: "com.example.owner=platform\ntraefik.enable=true",
	},
	"mode-kind": {
		title: "模式类型",
		summary: "这个服务使用四种调度模式中的哪一种。",
		details: [
			"Replicated 服务运行固定数量的任务，分散在整个集群中。Global 服务在每个符合条件的节点上正好运行一个任务，这正是日志采集器和监控代理想要的。",
			"两种 job 模式让任务跑到完成，而不是永远重启。它们从 API v1.41 开始提供，需要 Docker 20.10 或更新版本。",
		],
		options: [
			{
				label: "Replicated",
				hint: "固定任务数量，调度到任何放得下的地方。",
			},
			{
				label: "Global",
				hint: "每个符合条件的节点上正好一个任务；副本数被忽略。",
			},
			{
				label: "Replicated job",
				hint: "运行 N 个任务直到完成，然后停止。",
			},
			{
				label: "Global job",
				hint: "在每个节点上运行一个任务直到完成。",
			},
		],
		caution:
			"你无法在 replicated 与 global 之间转换已存在的服务；守护进程会返回 `rpc error: ... mode cannot be changed`。",
	},
	replicas: {
		title: "副本数",
		summary: "replicated 服务应保持运行的任务数量。",
		details: [
			"扩缩容是最廉价的服务更新：spec 其余部分完全没变，所以 Swarm 只是启动或停止任务，绝不会重新拉取镜像。",
			"把它设为 0 是官方支持的「暂停」服务方式——spec 保持完整，恢复时也不需要改动别的。",
		],
		placeholder: "3",
	},
	"job-max-concurrent": {
		title: "任务最大并发",
		summary: "同时运行的 job 副本数上限。",
		details: [
			"只对 `ReplicatedJob` 有意义。用它给批处理任务限流，避免打满整个集群。",
		],
		apiDefault: "1",
		placeholder: "2",
	},
	"job-total-completions": {
		title: "任务总完成数",
		summary: "必须进入 Completed 状态的副本总数。",
		details: [
			"未设置时守护进程会退回到 `MaxConcurrent`，也就是跑一批任务然后结束。",
		],
		placeholder: "10",
	},
};
