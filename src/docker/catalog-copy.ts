import type { Locale } from "#/i18n";
import type { FieldDef, SectionDef } from "./field-types";
import type { Preset } from "./presets";

type SectionCopy = {
	summary?: string;
	details?: Array<string>;
};

type FieldCopy = {
	title?: string;
	summary?: string;
	details?: Array<string>;
	caution?: string;
};

type PresetCopy = {
	summary?: string;
	rationale?: string;
};

const SECTION_COPY_ZH: Record<string, SectionCopy> = {
	service: {
		summary: "ServiceSpec 体的顶层键 - 服务名称和元数据。",
		details: [
			"它们位于你 POST 到 /services/{id}/update 的 JSON 根部。Name 每次更新都必须带上：如果提交的 spec 里没有它，服务很容易被意外重命名为空字符串。",
		],
	},
	mode: {
		summary: "Swarm 运行任务的方式 - 复制、全局，或者一次性 job。",
		details: [
			"`Mode` 是一个带标签的联合体：`Replicated`、`Global`、`ReplicatedJob` 和 `GlobalJob` 四者只能出现其一。把在线服务从 replicated 切到 global，或者反过来，daemon 会直接拒绝 - 你必须删除并重新创建服务。",
		],
	},
	container: {
		summary: "每个任务实际运行的内容：镜像、命令、环境变量和工作目录。",
		details: [
			"`ContainerSpec`、`PluginSpec` 和 `NetworkAttachmentSpec` 互斥 - 普通服务始终使用 `ContainerSpec`。",
			"这里修改 `Image` 才会触发滚动重部署。Swarm 会在更新时把 tag 解析成 digest，并把这个固定后的引用写进运行中的 spec，所以单纯把同一个 tag 重新推送到仓库不会自己触发 redeploy。",
		],
	},
	runtime: {
		summary: "内核级开关：只读根文件系统、capabilities、sysctl 和 ulimit。",
		details: [
			"这里大多是加固选项。它们设置成本低，也是安全审查最先会问到的内容。",
		],
	},
	health: {
		summary: "健康检查定义了任务什么时候算真正可用。",
		details: [
			"健康检查并不是 liveness probe 的同义词，它更接近 readiness：Swarm 会根据它判断一个新任务是不是足够稳定，可以继续推进 rollout。",
			"没有健康检查时，Swarm 只要容器进程启动成功就会把任务当成成功替换；一个很快就会退出的进程，前几秒也会被算作“成功”。",
		],
	},
	storage: {
		summary: "进入容器文件系统的内容，但不来自镜像。",
		details: [
			"这三类列表在更新时都会整块替换。只要你提交的 body 里没有 `Mounts`，服务原来挂上的每个 volume 都会被卸掉。",
			"Secrets 和 configs 由 manager 通过 TLS 分发，默认分别落在 `/run/secrets/<name>` 和 `/<name>`。它们都是不可变对象 - 旋转它们意味着新建一个对象，再让服务引用新对象，这本身就是一次服务更新。",
		],
	},
	resources: {
		summary:
			"每个任务的 CPU、内存和 PID 上限，以及调度器用来放置任务的 reservation。",
		details: [
			"Limit 和 reservation 回答的是两个不同的问题。limit 由内核 cgroup 在运行时强制执行：内存超过 limit 时容器会被 OOM kill。reservation 只在调度器决定哪个节点还有空间时才会被用到；任务跑起来以后它不再起约束作用。",
			"因为 reservation 会影响放置，过度预留就是你看到 `no suitable node (insufficient resources on N nodes)`，而集群看起来却还没满的原因。",
			'这一节对应最经典的一行更新体：`{"TaskTemplate":{"Resources":{"Limits":{"MemoryBytes":12884901888}}}}` - 12 GiB 被写成字节后的样子。',
		],
	},
	restart: {
		summary: "Swarm 在任务退出或崩溃时会怎么处理。",
		details: [
			"这管的是单个 task 的失败，和 `UpdateConfig.FailureAction` 不是一回事 - 后者管的是 rollout 过程中，新任务连续失败时整个发布该怎么办。",
			"重启不会复用旧容器：Swarm 会重新调度一个全新的任务，它可能会落到另一台节点上。",
		],
	},
	placement: {
		summary: "哪些节点有资格接任务，以及任务如何在节点间分布。",
		details: [
			"Constraints 是硬过滤条件 - 一个都匹配不到的任务会一直 Pending。Preferences 只是软规则，只在并列时起作用。",
		],
	},
	network: {
		summary: "任务加入哪些 overlay 网络，以及服务如何从集群外被访问。",
		details: [
			"spec 里有两个 `Networks` 键。`TaskTemplate` 下那个是现在真正生效的；顶层的 `ServiceSpec.Networks` 自 API v1.44 起已弃用，只给老客户端保留。这个构建器写的是 `TaskTemplate` 下面那个。",
			"给服务加上或移除网络都会重建全部任务 - 这不是原地修改网络连接的操作。",
		],
	},
	"task-misc": {
		summary: "日志、运行时选择，以及那个会强制触发 redeploy 的计数器。",
	},
	"update-config": {
		summary:
			"Swarm 如何把旧任务换成新任务 - 批量大小、节奏，以及新版本失败时怎么处理。",
		details: [
			"这就是“发布没人察觉”和“五分钟中断”之间的差别。`UpdateConfig` 存在于 service 上，所以它会影响*之后的每一次*更新，不只是你现在发出去的这一次。",
			"一次 rollout 会按 `Parallelism` 的批次推进。每个任务启动后，Swarm 会在 `Monitor` 时间窗里观察它；如果它在这个窗口里死掉，就算失败。失败比例一旦超过 `MaxFailureRatio`，`FailureAction` 就会决定后续动作。",
		],
	},
	"rollback-config": {
		summary: "同样的旋钮，但应用在 Swarm 回滚到上一版 spec 时。",
		details: [
			"每个 service 只保留一个 `PreviousSpec`。回滚就是把当前 spec 和它对调 - 没有更深的历史，所以连续回滚两次只会在最近两个版本之间来回切换。",
			"回滚既可以由 `UpdateConfig.FailureAction: rollback` 自动触发，也可以在调用更新接口时带上 `?rollback=previous` 手动触发（见 Request options 一节）。",
		],
	},
	request: {
		summary: "POST /services/{id}/update 这个请求本身的参数。",
		details: [
			"这一组字段不会出现在生成的 ServiceSpec 里。它们控制的是请求 URL 和头部，而不是 spec 本身。",
		],
	},
};

const FIELD_COPY_ZH: Record<string, FieldCopy> = {
	name: {
		title: "服务名称",
		summary: "服务的名称。",
		details: [
			"更新体被 daemon 视为完整的期望状态，所以即使只改别的字段，`Name` 也必须带上。除非你真的要重命名服务，否则请保持它和当前名称一致。",
			"允许重命名服务，但不会重建任务；附加在这个服务上的 overlay 网络 DNS 记录会跟着新名称更新。",
		],
		caution:
			"在更新体里省略 Name 很容易导致 `rpc error: code = InvalidArgument desc = name must be valid`。",
	},
	labels: {
		title: "服务标签",
		summary: "附加在 service 对象上的用户自定义键值元数据。",
		details: [
			"服务标签挂在 service 本身，不是挂在容器上 - 适合存放所有权、成本中心或路由元数据，像 Traefik 这类工具会通过 Swarm API 读取它们。",
			"标签在更新时会整块替换。你在这个 map 里省略的键会从 service 上被删除。",
		],
	},
};

const PRESET_COPY_ZH: Record<string, PresetCopy> = {
	"memory-limit": {
		summary: "最小的单字段 body：TaskTemplate.Resources.Limits.MemoryBytes。",
		rationale:
			"这是最小的有用更新体，也是说明部分 spec 为什么危险的最好例子：单独发送它会把镜像、环境和每个挂载都删掉，所以这个对象必须合并进你从 GET /services/{id} 读回来的 spec。",
	},
	"zero-downtime": {
		summary: "start-first 顺序、真实健康检查，以及新版本出问题时自动回滚。",
		rationale:
			"这是让发布对用户不可见的组合：一次只更新一个任务，替代任务先启动再停旧任务，每个新任务都会被观察足够长的时间以捕捉 crash loop，失败则回滚服务，而不是把它留在半更新状态。",
	},
	scale: {
		summary: "只修改 Mode.Replicated.Replicas，别的都不动。",
		rationale:
			"扩容是 Swarm 最便宜的更新：task template 完全不变，所以既不会拉镜像，也不会替换正在运行的任务 - Swarm 只是启动或停止副本。",
	},
	"force-redeploy": {
		summary: "把 TaskTemplate.ForceUpdate 加 1，以便重新拉取可变标签。",
		rationale:
			"Swarm 只在 spec 变化时才动作。重新推送同一个 tag 之后没有任何差异，滚动更新不会发生。增加这个计数会制造一次 spec 差异，正常的 UpdateConfig 发布流程就会跑起来。",
	},
	hardened: {
		summary:
			"只读根文件系统、禁用所有 capabilities、启用 init 进程并使用非 root 用户。",
		rationale:
			"这是安全审查通常要求的默认姿态。tmpfs 挂载不是可选项 - 只读根文件系统会让几乎所有在启动时写入 /tmp 的镜像出问题。",
	},
	"manual-rollback": {
		summary: "调用接口并带上 ?rollback=previous，body 会被忽略。",
		rationale:
			"这是发布出问题但还没配置自动回滚时的逃生舱。daemon 会恢复 PreviousSpec；endpoint 仍然要求 body，但 body 的内容会被丢弃 - 所以这里生成的 JSON 故意几乎是空的。",
	},
};

function localizeCopy<T extends SectionCopy | FieldCopy | PresetCopy>(
	locale: Locale,
	english: T,
	chinese?: Partial<T>,
): T {
	if (locale !== "zh-CN" || !chinese) return english;
	return {
		...english,
		...chinese,
	} as T;
}

export function localizeSectionCopy(locale: Locale, section: SectionDef) {
	return localizeCopy(locale, section, SECTION_COPY_ZH[section.id]);
}

export function localizeFieldCopy(locale: Locale, field: FieldDef) {
	return localizeCopy(locale, field, FIELD_COPY_ZH[field.id]);
}

export function localizePresetCopy(locale: Locale, preset: Preset) {
	return localizeCopy(locale, preset, PRESET_COPY_ZH[preset.id]);
}

export function fieldSearchText(locale: Locale, field: FieldDef): string {
	const localized = localizeFieldCopy(locale, field);
	return [
		field.id,
		field.key,
		field.path,
		field.title,
		field.summary,
		...(field.details ?? []),
		field.caution ?? "",
		localized.title ?? "",
		localized.summary ?? "",
		...(localized.details ?? []),
		localized.caution ?? "",
		field.cli ?? "",
		field.compose ?? "",
	]
		.join(" ")
		.toLowerCase();
}
