import type { UiMessagesShape } from "./messages-en";

/**
 * The Chinese UI dictionary. Typed against the English one, so a missing or
 * misspelled key is a compile error rather than an English string leaking into
 * a Chinese page.
 *
 * Translation conventions:
 * - JSON keys and Engine API enum values stay in English (ServiceSpec,
 *   UpdateConfig, `start-first`, `dnsrr`); they are what you type.
 * - "你" throughout, matching the English original's neutral register.
 * - Units keep their symbols (`12 GiB`, `30s`); only the trailing words are
 *   translated (`seconds` → `秒`).
 */
export const zh: UiMessagesShape = {
	header: {
		brand: "服务更新构建器",
		navBuilder: "构建器",
		navGuide: "字段指南",
		navAbout: "关于",
		navApiDocs: "API 文档",
		followX: "前往 X 主页",
		github: "打开项目 GitHub",
	},
	footer: {
		copyright: "© {{year}} Your name here. 保留所有权利。",
		builtWith: "由 TanStack Start 构建",
	},
	theme: {
		light: "浅色",
		dark: "深色",
		auto: "跟随系统",
		switchAuto: "主题：跟随系统。点击切换到浅色。",
		switch: "主题：{{mode}}。点击切换到{{next}}。",
	},
	locale: {
		switch: "切换到英文",
		label: "EN",
		current: "当前语言：{{name}}",
	},
	home: {
		title: "Docker 服务更新构建器",
		description:
			"以可视化方式构建 Docker Engine API 的 ServiceUpdate 对象，并导出为 JSON、YAML 或 curl。",
		kicker: "Docker Engine API {{version}} · ServiceUpdate",
		heading: "构建一个你讲得清楚的服务更新对象。",
		intro:
			"勾选你要修改的键，用人类习惯的单位填写。每个字段都带着它的设计理由、对应的 CLI 参数，以及等价的 Compose 键。结果可导出为 JSON、YAML 或可直接运行的 curl 脚本。",
		warningLead: "先读这一段。",
		warningBody:
			"`POST /services/{id}/update` 会替换整个 ServiceSpec——它不是补丁接口。请把下面这个对象当作你要合并进 `GET /services/{id}` 读回的 spec 的*差异*。curl 标签页展示了这一完整流程。",
		apiRef: "Docker Engine API {{version}} — ServiceUpdate 参考文档",
		searchLabel: "查找字段",
		searchDescription:
			"{{sections}} 个小节共 {{fields}} 个键。搜索会匹配 JSON 键名、路径、CLI 参数与 Compose 键。",
		searchPlaceholder: "MemoryBytes, rollback, --limit-cpu, deploy.resources…",
	},
	presets: {
		kicker: "从预设开始",
		heading: "常见的更新形态",
		clearAll: "全部清空",
		empty: "或者直接在下面勾选字段。只有你启用的字段会出现在生成的对象里。",
		items: {
			memoryLimit: {
				title: "上调内存上限",
				summary:
					"最小的单键请求体：TaskTemplate.Resources.Limits.MemoryBytes。",
				rationale:
					"这是能用的最小更新体，也最能说明为什么残缺的 spec 危险：单独发送它会抹掉镜像、环境变量和所有挂载，所以它必须合并进你从 GET /services/{id} 读回的 spec。",
			},
			zeroDowntime: {
				title: "零停机发布",
				summary:
					"start-first 顺序、真正的健康检查，以及新版本出问题时自动回滚。",
				rationale:
					"让发布对用户不可见的组合拳：每次只动一个任务，新任务先起来再停旧任务，每个新任务都被观察足够久以捕捉崩溃循环，失败时自动回滚而不是把服务留在半更新状态。",
			},
			scale: {
				title: "调整副本数",
				summary: "只改 Mode.Replicated.Replicas，别的都不动。",
				rationale:
					"扩缩容是 Swarm 最廉价的更新：任务模板完全不变，因此不会拉取镜像、也不会替换任何运行中的任务——Swarm 只是启动或停止副本。",
			},
			forceRedeploy: {
				title: "强制重新部署",
				summary: "递增 TaskTemplate.ForceUpdate，重新拉取可变标签。",
				rationale:
					"只有 spec 发生变化 Swarm 才会动作。重新推送同一个标签后 spec 毫无差异，发布也就永远不会发生。递增这个计数器制造出一处差异，正常的 UpdateConfig 发布流程才会跑起来。",
			},
			hardened: {
				title: "加固容器",
				summary:
					"只读根文件系统、丢弃全部能力、启用 init 进程、使用非 root 用户。",
				rationale:
					"安全评审要求的默认姿态。tmpfs 挂载不是可选项——只读根文件系统会让几乎所有启动时写 /tmp 的镜像直接崩溃。",
			},
			manualRollback: {
				title: "手动回滚",
				summary: "用 ?rollback=previous 调用接口，请求体被忽略。",
				rationale:
					"当你已经发了版、又没配置自动回滚时的逃生通道。守护进程会恢复 PreviousSpec；接口仍然要求你提供请求体，但内容会被丢弃——所以这里生成的 JSON 是刻意接近空的。",
			},
		},
	},
	section: {
		set: "已设 {{count}} 项",
		show: "展开",
		hide: "收起",
	},
	field: {
		unset: "— 未设置 —",
		unit: "单位",
		serialisesTo: "序列化为 {{value}}",
		empty: "空——该键会从生成的对象中省略。",
		explain: "这个字段是做什么的？",
		hideExplanation: "收起说明",
		apiDefault: "API 默认值",
		cli: "CLI",
		compose: "Compose",
	},
	rows: {
		addEntry: "新增一条",
		remove: "删除",
		empty: "还没有条目——该键会从输出中省略。",
		booleanTrue: "true",
		booleanUnset: "未设置",
	},
	output: {
		kicker: "生成的对象",
		includedOne: "包含 1 个字段",
		includedOther: "包含 {{count}} 个字段",
		copy: "复制",
		copied: "已复制",
		copyBlocked: "复制被阻止",
		download: "下载",
		copyPermalink: "复制永久链接",
		jsonHint: "请求体，可以直接 POST。",
		yamlHint: "同一个对象，放进 PR 里更容易审阅。",
		curlHint: "针对 Docker socket 的完整「读—改—写」流程。",
		endpoint: "端点：",
		apiRef: "ServiceUpdate 参考文档",
	},
	review: {
		kicker: "检查",
		empty: "当前配置未检测到冲突。",
		countOne: "1 处需要确认",
		countOther: "{{count}} 处需要确认",
		levelError: "会被拒绝",
		levelWarning: "很可能是笔误",
		levelInfo: "值得了解",
	},
	furtherReading: {
		kicker: "字段指南",
		startHere: "从这里开始",
		forConfigured: "与你当前配置相关的背景知识",
		loading: "加载中…",
	},
	units: {
		seconds: "秒",
		minutes: "分钟",
		hours: "小时",
		bytes: "字节",
		inherit: "0（继承 / 不限制）",
		coresOne: "{{count}} 核",
		coresOther: "{{count}} 核",
		entriesOne: "1 条",
		entriesOther: "{{count}} 条",
		keys: "{{count}} 个键",
	},
	curl: {
		readStep: "# 1. 读取当前的 spec 及其版本号。",
		mergeStep:
			"# 2. 把下面的对象合并进那个 .Spec（jq '. * $patch' 会做深合并），",
		mergeStep2: "#    然后把合并后的 spec POST 回去。单独发送这个补丁",
		mergeStep3: "#    会清空你没写到的每一个键。",
	},
	about: {
		title: "关于 — Docker 服务更新构建器",
		kicker: "关于",
		heading: "一个只针对某个特定 JSON 对象的可视化编辑器。",
		intro:
			"Docker Engine API 的 `ServiceUpdate` 请求体层级很深、没有单位、也不宽容。这个构建器覆盖 Engine API {{version}} 的 {{sections}} 个小节、共 {{fields}} 个键，用平实的语言解释每一个键，并支持导出为 JSON、YAML 或可直接运行的 curl 脚本。",
		howItWorks: "它是怎么工作的",
		howItWorks1:
			"每个键都作为数据描述在 `src/docker/catalog/` 中——它的 JSON 路径、编辑器类型、说明文字、CLI 参数与 Compose 等价键。扩展覆盖面是一次数据改动，永远不需要改组件。",
		howItWorks2:
			"数字用人类单位编辑，再序列化成 API 要求的原始标量：纳秒、字节和 nano-CPU。",
		howItWorks3:
			"只有你勾选的键会被输出，这正是让结果成为一份可用差异、而不是一整份 spec 的原因。",
		howItWorks4:
			"跨字段检查会标出守护进程会拒绝的组合——dnsrr 搭配发布端口、start-first 搭配 host 模式端口、预留高于上限等等。",
		howItWorks5: "{{count}} 个预设编码的是完整且站得住脚的配置，而不是单个键。",
		stack: "技术栈",
		scope: "边界与实话",
		scopeBody:
			"这个应用从不连接 Docker 守护进程。它没有后端、不保存任何凭据，也无法真正应用任何东西——它只产出由你自己审阅、自己执行的文本。这是刻意的：服务更新里危险的部分是合并，而一个把合并藏起来的工具比没有工具更糟。",
		apiRef: "Engine API {{version}} — ServiceUpdate 参考文档",
		guide: "字段指南",
		builder: "构建器",
		stackEntries: {
			start:
				"框架本身。只用到 SSR 与路由——本项目没有任何 server function，所以构建产物可以直接当静态 SPA 部署。",
			router:
				"基于文件的路由加上 JSON 优先的 search params。整个构建器状态通过 ?c= 以 base64url 永久链接的形式往返。",
			store:
				"保存字段状态。具名 action 把 reducer 逻辑挡在组件之外；createAtom 派生出 spec、YAML 与检查结果。",
			query:
				"通过动态 import 加载字段指南。路由 loader 预热缓存，构建器页面读同一个条目。",
			intent:
				"分发那些 agent 在改动 router 或 Start 代码前要加载的库技能。见 AGENTS.md。",
			cli: "负责初始化项目并安装附加组件。",
			biome: "格式化器与 linter。只此一套工具链，不用 ESLint 也不用 Prettier。",
			i18n: "以 cookie 为准的语言解析：服务端决定首屏语言，之后由客户端接手。",
		},
	},
	blog: {
		indexTitle: "字段指南 — Docker 服务更新构建器",
		indexDescription:
			"Docker Swarm 服务更新背后的心智模型：spec 整体替换、单位、发布与回滚。",
		kicker: "字段指南",
		heading: "schema 里没有写的那些部分。",
		intro:
			"Engine API 参考文档会告诉你每个键的类型。它不会告诉你这个接口会替换整份 spec、时长单位是纳秒，也不会告诉你为什么你的发布正在悄悄丢连接。这几篇文章会。",
		minRead: "阅读约 {{count}} 分钟",
		byline: "{{date}} · 阅读约 {{count}} 分钟",
		configureIt: "去配置",
		configureItBody: "构建器中与本文描述内容对应的小节：",
		allPosts: "← 全部文章",
		postTitle: "{{title}} — 字段指南",
		notFoundHeading: "没有这篇文章",
		notFoundBody: "这个 slug 不属于字段指南。",
		notFoundLink: "返回字段指南",
	},
	issues: {
		replicasOnGlobal: {
			title: "在 global 服务上设置了副本数",
			detail:
				"Mode 是标签联合体——同时发送 Mode.Global 和 Mode.Replicated.Replicas 会产生非法的 spec。global 服务永远在每个符合条件的节点上只跑一个任务。",
		},
		jobOnReplicated: {
			title: "在 replicated 服务上设置了 job 参数",
			detail:
				"MaxConcurrent 和 TotalCompletions 属于 Mode.ReplicatedJob。请把模式改成「Replicated job」或去掉这两个字段。",
		},
		portsRequireVip: {
			title: "发布端口要求 endpoint 模式为 vip",
			detail:
				"当 EndpointSpec.Mode 是 dnsrr 时，守护进程会拒绝发布端口的 spec，因为没有虚拟 IP 可以把入口流量路由过去。",
		},
		startFirstHostPorts: {
			title: "start-first 无法与 host 模式端口一起使用",
			detail:
				"start-first 发布会让新旧任务同时运行。两者都会尝试在节点上绑定同一个端口，于是新任务启动失败，发布卡住。",
		},
		maxFailureRatioRange: {
			title: "{{scope}}.MaxFailureRatio 必须介于 0 和 1 之间",
			detail:
				"它是小数而不是百分比：任务数的 20% 要写成 0.2。超出范围的取值会被守护进程拒绝。",
		},
		memoryReservationAboveLimit: {
			title: "内存预留超过了内存上限",
			detail:
				"调度器会预留比 cgroup 允许任务使用的更多内存，Docker 会拒绝这个组合。",
		},
		cpuReservationAboveLimit: {
			title: "CPU 预留超过了 CPU 上限",
			detail:
				"预留的核数超过上限允许的量，意味着任务永远用不到为它预留的资源。",
		},
		maxAttemptsWithConditionNone: {
			title: "Condition 为 none 时 MaxAttempts 不生效",
			detail:
				"任务永远不会被重启，所以尝试计数器被忽略。如果你是想限制重试次数，请用 Condition: on-failure。",
		},
		mountWithoutTarget: {
			title: "挂载缺少 Target",
			detail:
				"每个挂载都需要在 Target 里给出容器内的绝对路径，否则任务无法创建。",
		},
		tmpfsWithSource: {
			title: "tmpfs 挂载带了 Source",
			detail:
				"Type=tmpfs 时 Source 必须为空——文件系统建在内存里，没有什么可绑定的。",
		},
		bindWithoutConstraint: {
			title: "bind 挂载没有配套的调度约束",
			detail:
				"bind 挂载依赖某个特定节点上存在该路径。没有约束把服务钉在那台节点上，重新调度就会把任务落到一个缺这个路径的节点。",
		},
		malformedConstraint: {
			title: "约束表达式不是匹配或排除规则",
			detail: "约束只支持 == 和 !=。有问题的行：{{lines}}",
		},
		malformedEnv: {
			title: "环境变量条目缺少 '=' 分隔符",
			detail: "Env 是一组 VAR=value 字符串。有问题的行：{{lines}}",
		},
		healthBelowOneMs: {
			title: "健康检查时长小于 1 毫秒",
			detail:
				"Engine API 要求这些值要么是 0（继承镜像设置），要么至少是 1000000 纳秒。",
		},
		healthTimeoutNotShorter: {
			title: "健康检查超时不短于检查间隔",
			detail:
				"探测会重叠：上一次还没被判定失败，新的探测就已经开始，这会让本已吃力的任务负载成倍上升。",
		},
		monitorBeforeStartPeriod: {
			title: "发布观察窗口在健康检查开始上报之前就结束了",
			detail:
				"UpdateConfig.Monitor 应当长于 HealthCheck.StartPeriod 再加几个检查间隔，否则任务还没跑过第一次真正的探测就被判定为更新成功。",
		},
		rollbackWithoutConfig: {
			title: "启用了自动回滚但没有配置 RollbackConfig",
			detail:
				"守护进程会退回到默认值（parallelism 1、无延迟、stop-first）。显式设置 RollbackConfig 能让恢复更快也更可预期。",
		},
		readOnlyWithoutTmpfs: {
			title: "只读根文件系统但没有 tmpfs 挂载",
			detail:
				"大多数镜像在启动时会写 /tmp 或某个缓存目录。给这些路径加一个 tmpfs 挂载，否则容器会立刻失败。",
		},
		rowMissingKey: {
			title: "{{label}} 这一行缺少 {{key}}",
			detail: "每一条都需要 {{key}}；缺少它的行会产生非法的 spec。",
		},
		rowLabels: {
			ulimit: "Ulimit",
			network: "网络接入",
			secret: "Secret",
			config: "Config",
		},
		missingVersion: {
			title: "更新请求没有提供 version",
			detail:
				"`?version=` 是必填的查询参数。从 GET /services/{id} 读取 Version.Index 并原样发送，否则守护进程会返回 409 Conflict。",
		},
	},
};
