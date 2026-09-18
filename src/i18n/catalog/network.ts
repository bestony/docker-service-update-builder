import type { FieldCopyTable, SectionCopy } from "../field-copy";

/** Chinese copy for `src/docker/catalog/network.ts`. */

export const networkSectionZh: SectionCopy = {
	title: "网络",
	summary: "任务接入哪些 overlay 网络，以及这个服务如何从集群外部被访问。",
	details: [
		"spec 里有两个叫 `Networks` 的键。`TaskTemplate` 下那个是当前的；顶层 `ServiceSpec.Networks` 自 API v1.44 起已废弃，只为老客户端保留。这个构建器写的是 `TaskTemplate` 下的那个。",
		"接入或断开网络总是会重建所有任务——网络无法就地修改。",
	],
};

export const taskMiscSectionZh: SectionCopy = {
	title: "任务模板杂项",
	summary: "日志、运行时选择，以及那个用来强制重新部署的计数器。",
	details: [],
};

export const requestSectionZh: SectionCopy = {
	title: "请求参数",
	summary: "接口本身的查询字符串与请求头输入。它们*不是* JSON 请求体的一部分。",
	details: [
		"`version` 是必填项，也是乐观并发令牌。从 `GET /services/{id}` 读取 `Version.Index` 并原样发送；如果期间有别人更新过这个服务，守护进程会返回 409，你的写入会被拒绝，而不是悄悄覆盖别人的改动。",
	],
};

export const networkFieldsZh: FieldCopyTable = {
	networks: {
		title: "网络接入",
		summary: "任务接入的 overlay 网络，可附带 DNS 别名。",
		details: [
			"`Target` 是网络名称或 ID；该网络必须已经存在且可接入。别名给这个服务在该网络上额外的 DNS 名称，这就是在不改动调用方的前提下把它迁到一个改了名的服务上的办法。",
		],
		columns: [
			{ label: "网络", hint: "一个已存在的 overlay 网络的名称或 ID。" },
			{ label: "别名（逗号分隔）", hint: "在该网络上可解析的额外 DNS 名称。" },
		],
	},
	"endpoint-mode": {
		title: "Endpoint 模式",
		summary: "集群内部客户端如何解析并在任务之间做负载均衡。",
		details: [
			"`vip` 给服务一个稳定的虚拟 IP，让内核的 IPVS 把连接分散到各个任务上。这是默认值，也是绝大多数场景该用的。",
			"`dnsrr` 直接从 DNS 返回任务 IP，没有虚拟 IP。当你的客户端自己做负载均衡、或者需要看到具体副本时选它——但要当心客户端运行时里的 DNS 缓存。",
		],
		options: [
			{ label: "vip", hint: "单一虚拟 IP，内核侧负载均衡。默认值。" },
			{ label: "dnsrr", hint: "在任务 IP 上做 DNS 轮询。不能发布端口。" },
		],
		caution:
			"只有在 vip 模式下才能发布端口。同时包含 dnsrr 与 EndpointSpec.Ports 的 spec 会被守护进程拒绝。",
	},
	ports: {
		title: "发布的端口",
		summary: "暴露到集群外部的端口。",
		details: [
			"`ingress` 通过路由网格把端口发布在*每一个*节点上，所以任意节点的 IP 都能用，哪怕那台节点上没有任务在跑。`host` 绕过路由网格，只在真正运行任务的节点上绑定端口——更快、也保留客户端源 IP，但端口从此成为节点的独占资源。",
			"发布整个 `Ports` 数组会替换掉之前的那一份；把它整个省略则会移除所有已发布端口。",
		],
		columns: [
			{ label: "名称", hint: "这一条端口记录的可选标签。" },
			{
				label: "协议",
				hint: "传输协议。",
				options: [
					{ label: "tcp", hint: "默认值。" },
					{ label: "udp", hint: "数据报流量；路由网格支持它。" },
					{ label: "sctp", hint: "很少使用；需要内核支持。" },
				],
			},
			{
				label: "目标端口",
				hint: "容器内进程监听的端口。",
			},
			{
				label: "发布端口",
				hint: "在 swarm 节点上暴露的端口。",
			},
			{
				label: "发布模式",
				hint: "端口是否走路由网格。",
				options: [
					{
						label: "ingress",
						hint: "路由网格：在每个节点上都能访问。默认值。",
					},
					{
						label: "host",
						hint: "直接绑定在运行任务的节点上；会阻塞 start-first 发布。",
					},
				],
			},
		],
	},
	"force-update": {
		title: "强制更新计数器",
		summary: "一个任意计数器，仅凭它变化就能触发一次滚动重新部署。",
		details: [
			"只有 spec 有差异时 Swarm 才会重新部署。如果你重新推送了 `myapp:latest` 并希望集群再拉一次，spec 里什么都没变——于是你递增这个整数，发布就会跑起来，并且和真实变更一样遵守 UpdateConfig。",
			"从 `GET /services/{id}` 读出当前值，发送它加一。发送相同的值是空操作。",
		],
		placeholder: "1",
	},
	runtime: {
		title: "Runtime",
		summary: "由哪种任务执行器来运行这份负载。",
		details: [
			"普通容器服务留空即可。`plugin` 和 `attachment` 会选择另外两种 spec 形态，应用服务用不到。",
		],
		placeholder: "container",
	},
	"log-driver-name": {
		title: "日志驱动",
		summary: "这个服务的任务使用的日志驱动。",
		details: [
			"按服务覆盖守护进程默认值——当某个吵闹的服务该发到远端收集器、而其他服务继续用 json-file 时很有用。",
			"常见取值：`json-file`、`local`、`journald`、`gelf`、`fluentd`、`awslogs`、`none`。",
		],
		placeholder: "json-file",
		caution:
			"对于 gelf、fluentd 这类不支持回读的驱动，`docker service logs` 会失效。",
	},
	"log-driver-options": {
		title: "日志驱动选项",
		summary: "驱动专属选项，按 `key=value` 每行一条。",
		details: [
			"对 `json-file` 来说关键的两个是 `max-size` 和 `max-file`；没有它们，一个话多的容器可以把节点磁盘写满。",
		],
		placeholder: "max-size=10m\nmax-file=3",
	},
	"dns-nameservers": {
		title: "DNS 名称服务器",
		summary: "写入容器 resolv.conf 的名称服务器 IP。",
		details: [
			"覆盖它会替换掉 Docker 内嵌在 127.0.0.11 的 DNS 服务器，而其他服务名正是靠它解析的。请显式把它加回去，否则服务发现会失效。",
		],
		placeholder: "127.0.0.11\n10.0.0.53",
		caution: "从列表里去掉 127.0.0.11 会破坏 Swarm 的内部服务发现。",
	},
	"dns-search": {
		title: "DNS 搜索域",
		summary: "追加到非全限定查询后面的搜索后缀。",
		details: ["每多一个后缀，每次失败的查询就多一次往返，所以列表保持短一些。"],
		placeholder: "svc.internal",
	},
	"dns-options": {
		title: "DNS 解析选项",
		summary: "诸如 `ndots:1` 或 `timeout:1` 的解析器标志。",
		details: [
			"对于大量向全限定名称发起出站查询的服务，`ndots:1` 是解决多余 DNS 往返的常见办法。",
		],
		placeholder: "ndots:1\ntimeout:1",
	},
	"req-service-id": {
		title: "服务 ID 或名称",
		summary: "标识要更新哪个服务的路径参数。",
		details: ["完整 ID 或服务名称都可以。"],
		placeholder: "api-gateway",
	},
	"req-version": {
		title: "version（必填）",
		summary: "服务当前的版本号，用于检测写入冲突。",
		details: [
			"从 `GET /services/{id}` 响应里的 `Version.Index` 取值——要的是你这次更新*之前*的值。每次成功的更新都会让它加一。",
			"省略它或发送过期的值会得到 `409 Conflict: update out of sequence`。",
		],
		placeholder: "42",
	},
	"req-rollback": {
		title: "rollback",
		summary: "让守护进程恢复上一个 spec，并忽略请求体。",
		details: [
			"手动回滚时设为 `previous`。接口仍然要求提供 JSON 请求体，但内容会被丢弃。",
		],
		options: [
			{
				label: "previous",
				hint: "服务端回退到 PreviousSpec；请求体被忽略。",
			},
		],
	},
	"req-registry-auth-from": {
		title: "registryAuthFrom",
		summary: "未发送认证头时，从哪里取仓库凭据。",
		details: [
			"只有在 `X-Registry-Auth` 请求头缺失时才会被使用。回滚时通常想用 `previous-spec`，因为对旧镜像有效的凭据存在那里。",
		],
		options: [
			{
				label: "spec",
				hint: "使用附加在即将应用的 spec 上的凭据。默认值。",
			},
			{
				label: "previous-spec",
				hint: "复用上一个 spec 的凭据；回滚时的常见选择。",
			},
		],
	},
};
