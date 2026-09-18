import type { FieldCopyTable, SectionCopy } from "../field-copy";

/** Chinese copy for `src/docker/catalog/container.ts`. */

export const containerSectionZh: SectionCopy = {
	title: "容器规格",
	summary: "每个任务实际运行什么：镜像、命令、环境变量与工作目录。",
	details: [
		"`ContainerSpec`、`PluginSpec` 和 `NetworkAttachmentSpec` 互斥——普通服务总是使用 `ContainerSpec`。",
		"在这里改 `Image` 才是触发滚动重新部署的动作。Swarm 在更新时把标签解析成 digest 并把它钉在每一个任务上，所以往同一个标签重新推镜像本身**不会**重新部署任何东西。",
	],
};

export const runtimeSectionZh: SectionCopy = {
	title: "运行时与安全",
	summary: "内核层面的开关：只读根文件系统、能力、sysctl 与 ulimit。",
	details: [
		"这里大多是加固相关的旋钮。设置成本很低，而且是安全评审首先会问的东西。",
	],
};

export const healthSectionZh: SectionCopy = {
	title: "健康检查",
	summary: "Swarm 用来判断任务是否健康的探针——也因此决定了一次发布能不能继续。",
	details: [
		"健康检查才是让滚动更新安全的东西。没有它，Swarm 在进程一启动时就认为任务成功，于是「启动后立刻崩溃循环」的容器在 `UpdateConfig.Monitor` 期间仍然算作一个健康的副本。",
		"这里每个时长都是纳秒，且必须是 0（继承镜像设置）或至少 1 毫秒。",
	],
};

export const containerFieldsZh: FieldCopyTable = {
	image: {
		title: "镜像",
		summary: "每个任务运行的镜像引用。",
		details: [
			"给一个标签（`nginx:1.27`），或者为了可复现性更好，给一个 digest（`nginx@sha256:...`）。管理器会把标签解析成一次 digest 并把钉住的引用存进运行中的 spec，这就是为什么 `docker service inspect` 显示的字符串比你发送的更长。",
			"当镜像位于私有仓库时，加上 `--with-registry-auth`（CLI）或 `X-Registry-Auth` 头（API），否则 worker 节点拉不到镜像。",
		],
		placeholder: "nginx:1.27-alpine",
		caution:
			"往同一个标签重新推镜像不会重启任务。用 ForceUpdate 或 digest 来确保重新部署。",
	},
	command: {
		title: "Command（覆盖 entrypoint）",
		summary: "替换镜像的 ENTRYPOINT。每行一个 argv 元素。",
		details: [
			"这是 argv，不是一行 shell：`sh -c 'foo | bar'` 必须写成三行——`sh`、`-c`、`foo | bar`。",
			"留空则保留镜像声明的值。",
		],
		placeholder: "nginx\n-g\ndaemon off;",
	},
	args: {
		title: "Args（命令参数）",
		summary: "追加在 entrypoint 之后的参数。每行一个。",
		details: [
			"`Args` 对应镜像的 CMD。更新时它会被整体替换——发送空数组是清空参数，而不是保持不动。",
		],
		placeholder: "--config\n/etc/app/config.yaml",
	},
	env: {
		title: "环境变量",
		summary: "注入到每个任务的一组 `VAR=value` 字符串。",
		details: [
			"注意形状：这是*字符串数组*，不是对象。`LOG_LEVEL=debug` 是其中一个元素。",
			"更新时 Env 会被整体替换，所以一份省略了 `Env` 的残缺 spec 会清空所有变量。这是手写更新体搞坏服务最常见的方式。",
		],
		placeholder: "NODE_ENV=production\nLOG_LEVEL=info",
		caution:
			"不要把密钥放在这里——任何能调用 `docker service inspect` 的人都能读到 env。请改用 Secrets。",
	},
	"container-labels": {
		title: "容器标签",
		summary: "盖在服务每个容器上的键值元数据。",
		details: [
			"与服务标签不同：这些落在容器上，所以在 worker 节点上 `docker ps --filter label=...` 能看到它们。",
		],
		placeholder: "com.example.tier=frontend",
	},
	workdir: {
		title: "工作目录",
		summary: "命令运行时所在的目录。",
		details: [
			"覆盖镜像的 WORKDIR。这个路径不会替你创建——它必须已经存在于镜像里或某个挂载的卷上。",
		],
		placeholder: "/srv/app",
	},
	user: {
		title: "用户",
		summary: "进程以哪个用户（以及可选的组）运行。",
		details: [
			"接受 `name`、`uid`、`name:group` 或 `uid:gid`。数字 id 更稳，因为不依赖镜像里的 /etc/passwd。",
		],
		placeholder: "1000:1000",
	},
	groups: {
		title: "附加组",
		summary: "容器进程额外加入的组。每行一个。",
		details: ["当挂载的宿主设备或 socket 属于主用户不在的那个组时很有用。"],
		placeholder: "docker\n2000",
	},
	hostname: {
		title: "主机名",
		summary: "每个容器对外报告的主机名，需为 RFC 1123 名称。",
		details: [
			"Swarm 会在这里展开模板占位符 `{{.Service.Name}}`、`{{.Task.Slot}}` 和 `{{.Node.Hostname}}`，这就是给有状态副本稳定身份的办法。",
		],
		placeholder: "{{.Service.Name}}-{{.Task.Slot}}",
	},
	hosts: {
		title: "额外 hosts",
		summary: "额外的 /etc/hosts 条目，格式为 `IP hostname [aliases...]`。",
		details: [
			"注意顺序：API 要的是 `10.0.0.5 legacy-db`，也就是 IP 在前——和 CLI 的 `--host legacy-db:10.0.0.5` 正好相反。",
		],
		placeholder: "10.0.0.5 legacy-db legacy-db.internal",
	},
	"stop-signal": {
		title: "停止信号",
		summary: "用来请容器关闭的信号。",
		details: [
			"默认为 SIGTERM。有些服务器（例如 1.19 之前的 nginx）想要 SIGQUIT 才能优雅地排空连接。",
		],
		placeholder: "SIGQUIT",
	},
	"stop-grace-period": {
		title: "停止宽限期",
		summary: "发出停止信号后，等多久才强制杀死容器。",
		details: [
			"这是你的进程处理完在途请求的预算。如果它短于你最长的请求，滚动更新就会丢连接。",
			"Docker 自己的默认值是 10 秒，对任何处理长连接 HTTP 或 WebSocket 流量的服务来说通常都太短。",
		],
		placeholder: "30",
	},
	"read-only": {
		title: "只读根文件系统",
		summary: "把容器的根文件系统挂载为只读。",
		details: [
			"投入产出比很高的一项加固。配合给 `/tmp` 以及进程会写入的任何缓存目录挂一个 tmpfs，否则它会在启动时崩溃。",
		],
	},
	init: {
		title: "运行 init 进程",
		summary: "以 PID 1 运行一个微型 init，用于转发信号并回收僵尸进程。",
		details: [
			"当镜像的 entrypoint 是 shell 脚本、或是不回收子进程的语言运行时，就打开它。没有它，`StopSignal` 可能永远到不了你的进程，每次停止都会在宽限期后退化成 SIGKILL。",
		],
	},
	tty: {
		title: "分配伪终端",
		summary: "给容器接上一个伪终端。",
		details: [
			"服务场景基本用不到。它会改变某些运行时的 stdout 缓冲方式，可能让日志从块缓冲变成行缓冲。",
		],
	},
	"open-stdin": {
		title: "保持 stdin 打开",
		summary: "让容器的 stdin 保持打开。",
		details: ["只对交互式或 REPL 型负载有用；长期运行的服务应该关掉它。"],
	},
	"cap-add": {
		title: "要添加的能力",
		summary: "在默认集合之上授予的 Linux 能力。",
		details: [
			"用完整的 `CAP_` 名称，例如以非 root 用户绑定 1024 以下端口需要 `CAP_NET_BIND_SERVICE`。",
			"从 API v1.41 起可用。",
		],
		placeholder: "CAP_NET_BIND_SERVICE",
	},
	"cap-drop": {
		title: "要丢弃的能力",
		summary: "从默认集合中移除的 Linux 能力。",
		details: [
			"`CAP_ALL` 会丢弃全部能力，之后再按进程需要逐个加回来。这种「默认拒绝」的姿态正是审计想要的。",
		],
		placeholder: "CAP_ALL",
	},
	sysctls: {
		title: "Sysctl",
		summary: "在容器内设置的、按命名空间隔离的内核参数。",
		details: [
			"只有命名空间化的 sysctl 能生效——`net.core.somaxconn` 可以，`net.ipv4.tcp_tw_reuse` 不行（后者是宿主全局的，必须在节点上设置）。",
			"Swarm 在这里不做任何校验；写错键会在任务启动时以一个晦涩的 OCI runtime 错误失败。",
		],
		placeholder: "net.core.somaxconn=1024",
	},
	ulimits: {
		title: "Ulimit",
		summary: "按进程的资源限制，例如打开文件描述符的上限。",
		details: [
			"对高并发服务器来说关键的是 `nofile`：内核默认的 1024 会悄悄把你的连接数卡住。",
			"Soft 是实际生效的值，Hard 是进程允许自行提升到的上限。",
		],
		columns: [
			{
				label: "名称",
				hint: "不带 RLIMIT_ 前缀的限制名，例如 nofile、nproc、core。",
			},
			{
				label: "Soft",
				hint: "启动时实际生效的值。",
			},
			{
				label: "Hard",
				hint: "进程允许把 soft 上限提升到的最大值。",
			},
		],
	},
	isolation: {
		title: "隔离方式（仅 Windows）",
		summary: "Windows 容器使用的隔离技术。",
		details: [
			"在 Linux 节点上被忽略。`hyperv` 让每个容器拥有自己的内核，代价是启动更慢。",
		],
		options: [
			{ label: "default", hint: "使用守护进程配置的方式。" },
			{
				label: "process",
				hint: "共享内核；更快，仅限 Windows Server。",
			},
			{
				label: "hyperv",
				hint: "Hyper-V 隔离；边界更强，启动更慢。",
			},
		],
	},
	"health-test": {
		title: "Test",
		summary: "探测命令，每行一个 argv 元素。",
		details: [
			"第一行是模式：`CMD` 直接执行后续各行，`CMD-SHELL` 把紧随其后的单行交给镜像的 shell 执行，`NONE` 则完全禁用继承来的健康检查。",
			"空数组表示「继承镜像设置」。退出码 0 表示健康，1 表示不健康，其他值是错误。",
		],
		placeholder: "CMD-SHELL\ncurl -fsS http://localhost:8080/healthz || exit 1",
	},
	"health-interval": {
		title: "Interval",
		summary: "两次探测之间的时间。",
		details: [
			"间隔越短越早发现故障，但每个副本上的探测负载也成倍增加。5–10 秒是常见的折中。",
		],
		placeholder: "10",
	},
	"health-timeout": {
		title: "Timeout",
		summary: "单次探测超过多久算失败。",
		details: [
			"探测超过这个时长会被直接杀掉（不做优雅关闭）并记为一次失败。让它明显小于 `Interval`，否则探测会重叠。",
		],
		placeholder: "3",
	},
	"health-retries": {
		title: "Retries",
		summary: "任务被标记为不健康前需要连续失败多少次。",
		details: [
			"用来防止一次抖动就重启一个健康的任务。常用值是 3；0 表示继承镜像设置。",
		],
		placeholder: "3",
	},
	"health-start-period": {
		title: "StartPeriod",
		summary: "预热窗口，在此期间探测失败不计入。",
		details: [
			"这是最容易被忘掉的字段。一个 JVM 或者启动时要跑迁移的服务需要几十秒才能响应；没有 start period，最初几次探测就会失败，重试耗尽，Swarm 于是把任务放进重启循环。",
		],
		placeholder: "60",
	},
};
