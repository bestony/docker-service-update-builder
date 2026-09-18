import type { FieldCopyTable, SectionCopy } from "../field-copy";

/** Chinese copy for `src/docker/catalog/rollout.ts`. */

export const updateConfigSectionZh: SectionCopy = {
	title: "更新配置（发布策略）",
	summary:
		"Swarm 如何用新任务替换旧任务——批次大小、节奏，以及新版本失败时怎么办。",
	details: [
		"这就是「没人察觉的发布」和「五分钟故障」之间的差别。`UpdateConfig` 保存在服务上，因此它作用于*未来每一次*更新，而不只是你现在发送的这一次。",
		"一次发布以 `Parallelism` 个任务为一波推进。每个任务启动后，Swarm 会观察它 `Monitor` 那么久；如果它在这个窗口内死掉，这个任务就算失败。一旦失败比例超过 `MaxFailureRatio`，就由 `FailureAction` 决定下一步。",
	],
};

export const rollbackConfigSectionZh: SectionCopy = {
	title: "回滚配置",
	summary: "同一组旋钮，在 Swarm 回退到上一个 spec 而不是向前滚动时生效。",
	details: [
		"每个服务只保存一个 `PreviousSpec`。回滚就是拿它把当前 spec 换掉——没有更早的历史，所以连续回滚两次只是在最近两个版本之间来回切换。",
		"回滚可以由 `UpdateConfig.FailureAction: rollback` 自动触发，也可以通过带 `?rollback=previous` 调用更新接口手动触发（见「请求参数」一节）。",
	],
};

export const rolloutFieldsZh: FieldCopyTable = {
	"update-parallelism": {
		title: "Parallelism",
		summary: "一波更新多少个任务。",
		details: [
			"1 最安全也最慢：50 个副本的服务要跑 50 波。调大能缩短发布时间，但也放大了坏镜像的影响范围。",
			"0 表示不限制——所有任务同时被替换，实际上等同于整个服务重启。",
		],
		placeholder: "1",
		caution: "Parallelism 为 0 会同时替换所有副本。通常不是你想要的。",
	},
	"update-delay": {
		title: "Delay",
		summary: "两波发布之间的停顿。",
		details: [
			"这段静置时间让你有机会在下一批出发前发现问题。它也给了连接池和缓存预热的时间。",
			"Delay 与 Monitor 相互独立：Delay 控制波次节奏，Monitor 决定任务要存活多久才算合格。",
		],
		placeholder: "10",
	},
	"update-failure-action": {
		title: "FailureAction",
		summary: "更新的任务失败太多之后该做什么。",
		details: [
			"`rollback` 是大多数集群都该开着的设置。没有它，一次糟糕的发布会把服务留在半更新状态并暂停，直到有人发现。",
			"`pause`（引擎默认值）会就地停住发布，让新旧任务混着继续运行。",
		],
		options: [
			{
				label: "continue",
				hint: "不管怎样继续发布。只适合任务本来就会不断更替的场景。",
			},
			{
				label: "pause",
				hint: "在途中冻结发布，等人介入。引擎默认值。",
			},
			{
				label: "rollback",
				hint: "按 RollbackConfig 自动回退到上一个 spec。",
			},
		],
	},
	"update-monitor": {
		title: "Monitor",
		summary: "每个已更新任务被观察多久以判定失败。",
		details: [
			"在这个窗口内死掉的任务会计入 `MaxFailureRatio`；活过窗口的任务被判定为成功，发布继续推进。",
			"把它设得长于健康检查的 start period 再加几个检查间隔，否则启动慢的服务在还没跑过任何一次探测之前就被判定为健康了。",
		],
		placeholder: "30",
	},
	"update-max-failure-ratio": {
		title: "MaxFailureRatio",
		summary: "触发 FailureAction 之前允许失败的任务比例。",
		details: [
			"0 到 1 之间的小数，不是百分比。0 表示第一次失败就触发失败动作；0.2 表示五个里能容忍一个坏掉。",
		],
		placeholder: "0.2",
	},
	"updateconfig-order": {
		title: "Order",
		summary: "替换任务是在旧任务停止之前还是之后启动。",
		details: [
			"`start-first` 是获得真正零停机发布的唯一途径，因为始终至少有一个健康任务在提供服务。代价是节点上会短暂同时运行两个任务，所以你需要富余的 CPU、内存，以及最关键的——不能占用独占的宿主端口。",
			"用 `stop-first` 时，路由网格会在新任务就绪之前就摘掉旧任务，因此在容器启动加上健康检查预热的这段时间里，请求会被直接拒绝。",
		],
		options: [
			{
				label: "stop-first",
				hint: "先杀掉旧任务，再启动新任务。对持有独占资源的单实例是安全的。",
			},
			{
				label: "start-first",
				hint: "先启动新任务再杀掉旧任务。零停机必需，但需要富余容量。",
			},
		],
		caution:
			"start-first 无法与已发布的 host 模式端口共存：两个任务会在节点上争抢同一个端口。",
	},
	"rollback-parallelism": {
		title: "Parallelism",
		summary: "一波回滚多少个任务。",
		details: [
			"回滚通常希望比发布有*更高*的并发：服务已经坏了，此时速度比谨慎更重要。",
		],
		placeholder: "2",
	},
	"rollback-delay": {
		title: "Delay",
		summary: "两波回滚之间的停顿。",
		details: ["保持短一些——在一次已经坏掉的发布里，这里的每一秒都是停机时间。"],
		placeholder: "5",
	},
	"rollback-failure-action": {
		title: "FailureAction",
		summary: "回滚本身也开始失败时该做什么。",
		details: [
			"这里只能填 `continue` 和 `pause`——已经没有更早的版本可退，所以 `rollback` 不是合法取值。",
		],
		options: [
			{ label: "continue", hint: "无论如何把旧 spec 推下去。" },
			{ label: "pause", hint: "停下来等人介入。引擎默认值。" },
		],
	},
	"rollback-monitor": {
		title: "Monitor",
		summary: "每个被回滚的任务被观察多久以判定失败。",
		details: ["语义与更新的 monitor 相同，只是作用于回滚创建出来的任务。"],
		placeholder: "20",
	},
	"rollback-max-failure-ratio": {
		title: "MaxFailureRatio",
		summary: "回滚期间允许失败的任务比例。",
		details: [
			"通常设得比更新的比例更高：你宁愿把已知可用的版本恢复完，也不愿意停在一半。",
		],
		placeholder: "0.5",
	},
	"rollbackconfig-order": {
		title: "Order",
		summary: "替换任务是在旧任务停止之前还是之后启动。",
		details: [
			"与你为更新所做的选择保持一致。对一个已经坏掉的服务用 `stop-first` 回滚，意味着在好版本回来之前会有一小段停机。",
			"用 `stop-first` 时，路由网格会在新任务就绪之前就摘掉旧任务，因此在容器启动加上健康检查预热的这段时间里，请求会被直接拒绝。",
		],
		options: [
			{
				label: "stop-first",
				hint: "先杀掉旧任务，再启动新任务。对持有独占资源的单实例是安全的。",
			},
			{
				label: "start-first",
				hint: "先启动新任务再杀掉旧任务。零停机必需，但需要富余容量。",
			},
		],
	},
};
