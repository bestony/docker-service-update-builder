import type { FieldCopyTable, SectionCopy } from "../field-copy";

/** Chinese copy for `src/docker/catalog/storage.ts`. */

export const storageSectionZh: SectionCopy = {
	title: "挂载、Secret 与 Config",
	summary: "所有出现在容器文件系统里、但不来自镜像的东西。",
	details: [
		"这三份列表在更新时都是整体替换的。发送一个不含 `Mounts` 的请求体，会把服务原有的每个卷都卸载掉。",
		"Secret 与 Config 由管理器通过 TLS 投递，落地为文件（默认分别在 `/run/secrets/<name>` 和 `/<name>`）。它们是不可变的——轮换意味着创建一个新对象并让服务指向它，而这本身就是一次服务更新。",
	],
};

export const storageFieldsZh: FieldCopyTable = {
	mounts: {
		title: "挂载",
		summary: "挂到每个任务上的卷、bind 挂载与 tmpfs。",
		details: [
			"`volume` 是可移植的选择，由集群感知的驱动支持时能跨节点工作。`bind` 把服务绑死在某个特定节点的文件系统上，所以要配套一个调度约束，否则任务一旦被重新调度就会坏掉。",
			"`tmpfs` 是让只读根文件系统可用的关键：在 /tmp 以及任何缓存路径上挂一个。",
		],
		columns: [
			{
				label: "类型",
				hint: "使用哪种挂载机制。",
				options: [
					{ label: "volume", hint: "由驱动管理的具名卷。" },
					{
						label: "bind",
						hint: "宿主路径；要求该路径在节点上已存在。",
					},
					{
						label: "tmpfs",
						hint: "内存文件系统；Source 必须为空。",
					},
					{ label: "npipe", hint: "Windows 命名管道。" },
					{ label: "cluster", hint: "Swarm 集群卷（CSI）。" },
				],
			},
			{
				label: "Source",
				hint: "卷名或宿主路径。tmpfs 时必须为空。",
			},
			{ label: "Target", hint: "容器内的绝对路径。" },
			{ label: "只读", hint: "以无写权限方式挂载。" },
			{
				label: "Bind 传播",
				hint: "仅 bind 挂载：挂载事件如何在宿主与容器之间传播。",
				options: [
					{ label: "rprivate", hint: "默认值。两个方向都不传播。" },
					{ label: "private", hint: "不传播，非递归。" },
					{ label: "rshared", hint: "双向递归传播。" },
					{ label: "shared", hint: "双向传播。" },
					{ label: "rslave", hint: "仅宿主到容器，递归。" },
					{ label: "slave", hint: "仅宿主到容器。" },
				],
			},
			{
				label: "卷驱动",
				hint: "仅 volume 挂载：用来创建该卷的驱动。",
			},
			{
				label: "tmpfs 大小（字节）",
				hint: "仅 tmpfs 挂载：最大字节数。64 MiB 是 67108864。",
			},
		],
		caution:
			"没有配套调度约束的 bind 挂载是颗定时炸弹：任务一直正常，直到它被重新调度到一台没有该路径的节点上。",
	},
	secrets: {
		title: "Secret",
		summary: "以文件形式暴露给任务的 Swarm Secret。",
		details: [
			"API 通过 ID 而不是名称来引用 Secret——`SecretName` 只是顺带用于展示。构建请求体之前先用 `GET /secrets` 查出 ID。",
			"`File.Mode` 是十进制，不是八进制：模式 0444 要写成 292。",
		],
		columns: [
			{
				label: "Secret 名称",
				hint: "人类可读的名称，仅用于查找与展示。",
			},
			{
				label: "Secret ID",
				hint: "守护进程实际解析的 ID。必填。",
			},
			{
				label: "文件名",
				hint: "容器内 /run/secrets 下的文件名。",
			},
			{ label: "UID", hint: "挂载文件的属主 uid。" },
			{ label: "GID", hint: "挂载文件的属主 gid。" },
			{
				label: "模式（十进制）",
				hint: "以十进制整数表示的文件模式。0444 = 292，0400 = 256。",
			},
		],
	},
	configs: {
		title: "Config",
		summary: "以文件形式挂载进任务的 Swarm Config。",
		details: [
			"投递机制与 Secret 相同，但没有 tmpfs 和静态加密——用于 nginx.conf 这类非敏感文件。",
			"因为 Config 不可变，标准的轮换方式是这样：创建 `nginx.conf.v2`，把服务更新为引用它，等发布成功后再删除旧对象。",
		],
		columns: [
			{
				label: "Config 名称",
				hint: "人类可读的名称，仅用于查找与展示。",
			},
			{
				label: "Config ID",
				hint: "守护进程实际解析的 ID。必填。",
			},
			{
				label: "目标路径",
				hint: "文件在容器内的落地位置。",
			},
			{ label: "UID", hint: "挂载文件的属主 uid。" },
			{ label: "GID", hint: "挂载文件的属主 gid。" },
			{
				label: "模式（十进制）",
				hint: "以十进制整数表示的文件模式。0444 = 292。",
			},
		],
	},
};
