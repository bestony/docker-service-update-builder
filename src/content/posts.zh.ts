import type { Post } from "./posts";

/**
 * The Chinese field guide. Same slugs, dates, tags, section links and block
 * structure as `posts.ts` — only the prose differs, and code samples are
 * byte-identical because they are the thing you paste.
 *
 * `scripts/check-i18n.ts` asserts the two arrays line up block for block, so a
 * post added to one language and not the other fails `pnpm check-i18n` instead
 * of 404-ing for half the readers.
 */
export const postsZh: Array<Post> = [
	{
		slug: "partial-service-spec-is-a-trap",
		title: "残缺的 ServiceSpec 是个陷阱",
		summary:
			'为什么 {"TaskTemplate":{"Resources":{"Limits":{"MemoryBytes":12884901888}}}} 会删掉你的镜像，以及应该改发什么。',
		date: "2026-08-05",
		readingMinutes: 6,
		tags: ["ServiceUpdate", "semantics"],
		sections: ["resources", "request"],
		blocks: [
			{
				kind: "p",
				text: "几乎所有 Docker Swarm 教程都会展示一个只有一行的更新体。它看起来像个补丁。它不是补丁。",
			},
			{
				kind: "code",
				language: "json",
				code: '{\n  "TaskTemplate": {\n    "Resources": {\n      "Limits": { "MemoryBytes": 12884901888 }\n    }\n  }\n}',
			},
			{
				kind: "p",
				text: "把它 POST 到 /services/{id}/update，守护进程会精确地执行你的要求：用你发送的这个对象替换整个 ServiceSpec。镜像没了。环境变量没了。每一个挂载、端口、secret 和调度约束都没了。接着 Swarm 试着去协调一个没有镜像的服务，任务启动失败。",
			},
			{ kind: "h", text: "这个接口是「读—改—写」" },
			{
				kind: "p",
				text: "ServiceUpdate 接受的是完整的期望状态，不是差异。官方支持的流程有三步，而中间那一步正是人们跳过的。",
			},
			{
				kind: "ul",
				items: [
					"GET /services/{id}——读出当前的 .Spec 和 .Version.Index。",
					"在本地把你的改动合并进那份 spec。",
					"把合并后的 spec POST 回去，并带上 ?version=<你刚读到的索引>。",
				],
			},
			{
				kind: "code",
				language: "bash",
				code: "current=$(curl -s --unix-socket /var/run/docker.sock \\\n  http://localhost/v1.43/services/api-gateway)\n\nversion=$(echo \"$current\" | jq '.Version.Index')\n\necho \"$current\" | jq '.Spec * {\n  TaskTemplate: { Resources: { Limits: { MemoryBytes: 12884901888 } } }\n}' | curl -s -X POST --unix-socket /var/run/docker.sock \\\n  -H 'Content-Type: application/json' \\\n  \"http://localhost/v1.43/services/api-gateway/update?version=$version\" \\\n  --data-binary @-",
			},
			{
				kind: "note",
				text: "jq 的 `*` 运算符会对对象做深合并，这正是这里想要的语义。注意它合并对象，但会替换数组——Env、Mounts 和 Ports 都是数组，所以一份残缺的列表依然会抹掉其余部分。",
			},
			{ kind: "h", text: "version 参数为什么存在" },
			{
				kind: "p",
				text: "因为写入是整体替换，两个并发更新会悄无声息地互相覆盖。版本号就是乐观并发令牌：发送你读到的那个值，如果这期间有别的东西变了，守护进程会返回 409 Conflict，而不是把你的过期 spec 应用上去。",
			},
			{
				kind: "p",
				text: "这也是为什么 CLI 感觉比裸 curl 安全。`docker service update --limit-memory 12g` 替你把读取、合并和版本握手都做完了。API 只给你原语，不给你工作流。",
			},
			{ kind: "h", text: "那这个构建器是干什么的？" },
			{
				kind: "p",
				text: "生成的对象就是那份差异——你手写、然后拿去合并的那部分。把形状、嵌套层级和单位写对才是麻烦的地方；合并只是一个 jq 表达式。curl 标签页把两半放在一起展示，这样合并就永远不会被忘记。",
			},
		],
	},
	{
		slug: "reading-docker-units",
		title: "纳秒、nano-CPU 与裸字节",
		summary:
			"Engine API 没有任何单位后缀。这里是每个数值字段的换算方式，以及舍入在什么地方咬人。",
		date: "2026-08-05",
		readingMinutes: 4,
		tags: ["units", "resources"],
		sections: ["resources", "update-config", "health"],
		blocks: [
			{
				kind: "p",
				text: "Docker CLI 接受 `12g`、`30s` 和 `1.5` 表示核数。Engine API 一个都不接受。每个数值字段都是固定基准单位下的裸整数，而不同字段族的基准单位各不相同。",
			},
			{
				kind: "ul",
				items: [
					"时长——纳秒。30s 是 30000000000。这涵盖 UpdateConfig.Delay、Monitor、RestartPolicy.Delay 与 Window、StopGracePeriod，以及每一个 HealthCheck 时间参数。",
					"内存——字节，二进制的倍数。12 GiB 是 12 * 1024^3 = 12884901888。注意 `docker service update --limit-memory 12g` 里的 g 也指 GiB，不是 GB。",
					"CPU——nano CPU。一个核是 1000000000，所以 1.5 核是 1500000000。",
					"文件模式——十进制，不是八进制。以 0444 挂载的 secret 要写成 292。",
					"MaxFailureRatio——0 到 1 之间的小数。20% 是 0.2，不是 20。",
				],
			},
			{ kind: "h", text: "容易出错的地方" },
			{
				kind: "p",
				text: "有两种失败模式反复出现。第一种是给 12 GiB 写成 12000000000——一个十进制与二进制的口误，悄悄给你 11.18 GiB，然后在峰值负载下被 OOM 杀掉。第二种是给时长写成 30：30 纳秒不会被拒绝，它会被当作一个合法但荒谬地小的值接受下来。",
			},
			{
				kind: "note",
				text: "健康检查时长是唯一会做校验的例外：它们必须是 0 或至少 1000000 ns（1 毫秒）。0 的意思是「继承镜像设置」，这和「禁用」不是一回事。",
			},
			{ kind: "h", text: "把值读回来" },
			{
				kind: "p",
				text: "`docker service inspect` 打印的也是裸标量，所以当你把实际部署的东西和你想部署的东西做对比时，要做一次反向换算。这是一个把生成的对象纳入版本控制的好理由：这些数字本身不可读，但它们的 diff 是可读的。",
			},
		],
	},
	{
		slug: "zero-downtime-rollouts",
		title: "到底是什么让一次发布零停机",
		summary:
			"UpdateConfig、健康检查和停止宽限期是同一个机制。只设置其中一项什么也换不来。",
		date: "2026-08-05",
		readingMinutes: 7,
		tags: ["UpdateConfig", "rollout"],
		sections: ["update-config", "health", "container"],
		blocks: [
			{
				kind: "p",
				text: "Swarm 以一波波的方式替换任务。理解这一波就是全部：对每个任务，它启动（或停止）替换者，等待 Monitor 窗口，统计失败，然后要么在 Delay 之后继续，要么触发 FailureAction。",
			},
			{ kind: "h", text: "Order：最容易被忽略的那个设置" },
			{
				kind: "p",
				text: "默认是 `stop-first`：旧任务先被杀掉，然后新任务启动。在这两个事件之间，那个副本不存在。只有一个副本时这是硬停机；有几个副本时则是容量下滑，再加上路由网格对在途连接的处理带来的影响。",
			},
			{
				kind: "p",
				text: "`start-first` 把它反过来——新任务必须先跑起来，旧任务才收到信号。这是唯一可能做到真正零停机的顺序。代价是短暂的双倍容量，而且它和 host 模式发布的端口不兼容，因为两个任务会在节点上争抢同一个端口。",
			},
			{ kind: "h", text: "「在运行」不等于「已就绪」" },
			{
				kind: "p",
				text: "没有健康检查时，容器进程一启动 Swarm 就认为任务成功了。一个启动、什么也没连上、三秒后退出进程的服务，在最初那几秒里依然算作一次成功的替换——长到足够让下一波发出去。",
			},
			{
				kind: "p",
				text: "健康检查把「进程启动了」变成「进程有响应」。Monitor 这才有了意义：它是任务必须保持健康、才算一个合格替换者的那个窗口。",
			},
			{
				kind: "code",
				language: "json",
				code: '{\n  "UpdateConfig": {\n    "Parallelism": 1,\n    "Delay": 10000000000,\n    "Monitor": 60000000000,\n    "FailureAction": "rollback",\n    "MaxFailureRatio": 0,\n    "Order": "start-first"\n  }\n}',
			},
			{ kind: "h", text: "是排空，不是丢弃" },
			{
				kind: "p",
				text: "最后一块是关闭这一侧。StopSignal 会送达 PID 1，而 StopGracePeriod 决定你的进程在被 SIGKILL 之前有多少时间。实践中会坏掉这件事的有两种情况：一个不转发信号的 entrypoint shell 脚本（用 Init 修），以及一个比你最长请求还短的宽限期（把它提到 p99 加连接排空时间之上）。",
			},
			{
				kind: "ul",
				items: [
					"Order: start-first——副本数永远不少于开始时的数量。",
					"HealthCheck 配一个符合实际的 StartPeriod——是就绪探针，不是存活探针。",
					"Monitor 长于 StartPeriod 再加几个检查间隔。",
					"FailureAction: rollback——不需要人介入就能恢复。",
					"Init 加上高于 p99 的 StopGracePeriod——退出时不丢连接。",
				],
			},
			{
				kind: "note",
				text: "UpdateConfig 保存在服务上，不保存在请求上。设置一次就会作用于未来每一次更新，包括回滚自动触发的那几次。",
			},
		],
	},
	{
		slug: "rollback-mechanics",
		title: "回滚：只有一个 spec 的深度，而且是故意的",
		summary:
			"Swarm 只保存一个 PreviousSpec。这对自动回滚、手动回滚以及仓库凭据分别意味着什么。",
		date: "2026-08-05",
		readingMinutes: 5,
		tags: ["RollbackConfig", "operations"],
		sections: ["rollback-config", "request"],
		blocks: [
			{
				kind: "p",
				text: "每个服务对象都带着一个 Spec 和一个 PreviousSpec。没有第三个槽位。回滚就是把它俩对调，所以连续回滚两次只是在最近两个版本之间来回切换——它不会在历史上往回走得更远。",
			},
			{ kind: "h", text: "两种触发方式" },
			{
				kind: "p",
				text: "自动方式是把 UpdateConfig.FailureAction 设为 `rollback`：当足够多的已更新任务在自己的 Monitor 窗口内失败时，守护进程会自行回退，不需要任何人被叫起来。手动方式是带 ?rollback=previous 调用更新接口——接口仍然要求提供请求体，但内容会被完全忽略。",
			},
			{
				kind: "code",
				language: "bash",
				code: "curl -s -X POST --unix-socket /var/run/docker.sock \\\n  -H 'Content-Type: application/json' \\\n  'http://localhost/v1.43/services/api-gateway/update?version=43&rollback=previous&registryAuthFrom=previous-spec' \\\n  -d '{}'",
			},
			{ kind: "h", text: "registryAuthFrom 这颗雷" },
			{
				kind: "p",
				text: "仓库凭据是附加在 spec 上的。回滚期间你想要的凭据，是对旧镜像有效的那些，而它们存在上一个 spec 里——所以才要 `registryAuthFrom=previous-spec`。保持默认的 `spec` 时，回滚到一个私有镜像可能恰好在最需要它的那些节点上拉取失败。",
			},
			{ kind: "h", text: "RollbackConfig 要和 UpdateConfig 调得不一样" },
			{
				kind: "p",
				text: "发布应该谨慎；回滚应该快。服务已经坏了，所以更高的 Parallelism 和更短的 Delay 通常才对。不过 Order 要和发布保持一致：stop-first 的回滚在已知可用的版本回来之前，依然意味着一段容量缺口。",
			},
			{
				kind: "note",
				text: "RollbackConfig.FailureAction 只接受 `continue` 和 `pause`。已经没有更早的版本可回退，所以 `rollback` 在那里不是合法取值。",
			},
		],
	},
];
