import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type Locale = "en" | "zh-CN";

const LANGUAGE_STORAGE_KEY = "language";

const EN = {
	"nav.brand": "Service Update Builder",
	"nav.builder": "Builder",
	"nav.fieldGuide": "Field guide",
	"nav.about": "About",
	"nav.apiDocs": "API docs",
	"nav.followX": "Follow on X",
	"nav.github": "Open project GitHub",
	"language.switch": "Switch language",
	"language.english": "English",
	"language.chinese": "中文",
	"footer.copyright": "© {year} Your name here. All rights reserved.",
	"footer.builtWith": "Built with TanStack Start",
	"home.kicker": "Docker Engine API {version} · ServiceUpdate",
	"home.title": "Build a service update object you can actually explain.",
	"home.intro":
		"Tick the keys you want to change, in units humans use. Every field carries the reasoning behind it, the CLI flag it maps to, and the Compose key it corresponds to. The result exports as JSON, YAML or a runnable curl script.",
	"home.readFirst": "Read this first.",
	"home.warning":
		"replaces the whole ServiceSpec — it is not a patch endpoint. Treat the object below as the diff you merge into the spec you read from",
	"home.warningEnd": "The curl tab shows that flow end to end.",
	"home.apiReference": "Docker Engine API {version} — ServiceUpdate reference",
	"home.findField": "Find a field",
	"home.searchDescription":
		"{fields} keys across {sections} sections. Searching matches JSON keys, paths, CLI flags and Compose keys.",
	"home.searchPlaceholder":
		"MemoryBytes, rollback, --limit-cpu, deploy.resources…",
	"preset.kicker": "Start from a preset",
	"preset.title": "Common update shapes",
	"preset.clear": "Clear all",
	"preset.orTick":
		"Or tick any field below. Only the fields you enable end up in the generated object.",
	"section.set": "set",
	"section.hide": "Hide",
	"section.show": "Show",
	"field.unset": "— unset —",
	"field.unit": "Unit",
	"field.serializes": "Serialises to",
	"field.empty": "Empty — the key is omitted from the generated object.",
	"field.hideExplanation": "Hide explanation",
	"field.whatDoesThisDo": "What does this do?",
	"field.apiDefault": "API default",
	"field.cli": "CLI",
	"field.compose": "Compose",
	"rows.noEntries": "No entries yet — the key is omitted from the output.",
	"rows.unset": "unset",
	"rows.remove": "Remove",
	"rows.addEntry": "Add entry",
	"output.generated": "Generated object",
	"output.fieldsIncluded": "{count} field{suffix} included",
	"output.copy": "Copy",
	"output.download": "Download",
	"output.copyPermalink": "Copy permalink",
	"output.jsonHint": "The request body, ready to POST.",
	"output.yamlHint": "The same object, easier to review in a PR.",
	"output.curlHint":
		"The full read-modify-write flow against the Docker socket.",
	"output.endpoint": "Endpoint:",
	"output.apiReference": "ServiceUpdate reference",
	"copy.copied": "Copied",
	"copy.blocked": "Copy blocked",
	"review.title": "Review",
	"review.none": "No conflicts detected in the current selection.",
	"review.thingsToCheck": "{count} thing{suffix} to check",
	"review.error": "Will be rejected",
	"review.warning": "Likely a mistake",
	"review.info": "Worth knowing",
	"reading.kicker": "Field guide",
	"reading.start": "Start here",
	"reading.background": "Background for what you have configured",
	"reading.loading": "Loading…",
	"about.kicker": "About",
	"about.title": "A visual editor for one specific JSON object.",
	"about.intro":
		"The Docker Engine API's ServiceUpdate body is deeply nested, unit-free and unforgiving. This builder covers {fields} keys across {sections} sections of Engine API {version}, explains each one in plain language, and exports the result as JSON, YAML or a runnable curl script.",
	"about.howItWorks": "How it works",
	"about.how1":
		"Every key is described as data in src/docker/catalog/ — its JSON path, editor type, prose, CLI flag and Compose equivalent. Adding coverage is a data change, never a component change.",
	"about.how2":
		"Numbers are edited in human units and serialised to the raw scalars the API wants: nanoseconds, bytes and nano-CPUs.",
	"about.how3":
		"Only the keys you tick are emitted, which is what makes the output a usable diff rather than a whole spec.",
	"about.how4":
		"A cross-field review flags the combinations the daemon rejects — dnsrr with published ports, start-first with host-mode ports, reservations above limits, and more.",
	"about.how5":
		"{count} presets encode complete, defensible configurations rather than single keys.",
	"about.scope": "Scope and honesty",
	"about.scopeText":
		"This app never talks to a Docker daemon. It has no backend, holds no credentials, and cannot apply anything — it produces text you review and run yourself. That is deliberate: the dangerous part of a service update is the merge, and a tool that hides the merge would be worse than no tool.",
	"about.apiLink": "Engine API {version} — ServiceUpdate reference",
	"blog.kicker": "Field guide",
	"blog.title": "The parts that are not in the schema.",
	"blog.intro":
		"The Engine API reference tells you the type of every key. It does not tell you that the endpoint replaces the whole spec, that durations are nanoseconds, or why your rollout is quietly dropping connections. These posts do.",
	"blog.reading": "{minutes} min read",
	"blog.configure": "Configure it",
	"blog.configureText":
		"Sections of the builder that cover what this post describes:",
	"blog.allPosts": "← All posts",
	"blog.noPost": "No such post",
	"blog.noPostText": "That slug is not part of the field guide.",
	"blog.backToGuide": "Back to the field guide",
	"theme.light": "Light",
	"theme.dark": "Dark",
	"theme.auto": "Auto",
	"theme.autoDescription":
		"Theme: auto (follows the system). Click to switch to light.",
	"theme.modeDescription": "Theme: {mode}. Click to switch to {next}.",
	"section.service": "Service identity",
	"section.mode": "Scheduling mode",
	"section.container": "Container spec",
	"section.health": "Health check",
	"section.storage": "Mounts, secrets & configs",
	"section.resources": "Resources",
	"section.restart": "Restart policy",
	"section.placement": "Placement",
	"section.network": "Networking",
	"section.task-misc": "Task template extras",
	"section.update-config": "Update config (rollout strategy)",
	"section.rollback-config": "Rollback config",
	"section.request": "Request options",
	"preset.memory-limit": "Raise the memory limit",
	"preset.zero-downtime": "Zero-downtime rollout",
	"preset.scale": "Scale replicas",
	"preset.force-redeploy": "Force a redeploy",
	"preset.hardened": "Hardened container",
	"preset.manual-rollback": "Manual rollback",
} as const;

type MessageKey = keyof typeof EN;

const ZH: Record<MessageKey, string> = {
	"nav.brand": "Service 更新构建器",
	"nav.builder": "构建器",
	"nav.fieldGuide": "字段指南",
	"nav.about": "关于",
	"nav.apiDocs": "API 文档",
	"nav.followX": "前往 X 主页",
	"nav.github": "打开项目 GitHub",
	"language.switch": "切换语言",
	"language.english": "English",
	"language.chinese": "中文",
	"footer.copyright": "© {year} 你的名字。保留所有权利。",
	"footer.builtWith": "使用 TanStack Start 构建",
	"home.kicker": "Docker Engine API {version} · ServiceUpdate",
	"home.title": "构建一个真正讲得清楚的服务更新对象。",
	"home.intro":
		"用人类熟悉的单位勾选你要修改的字段。每个字段都附有背后的原因、对应的 CLI 参数和 Compose 键。结果可以导出为 JSON、YAML 或可直接运行的 curl 脚本。",
	"home.readFirst": "请先阅读。",
	"home.warning":
		"会替换整个 ServiceSpec，它不是 patch 接口。请把下面的对象当作 diff，合并到你从",
	"home.warningEnd": "读取的 spec 中。curl 标签页展示了完整流程。",
	"home.apiReference": "Docker Engine API {version} — ServiceUpdate 参考",
	"home.findField": "查找字段",
	"home.searchDescription":
		"{fields} 个字段，分布在 {sections} 个分组中。搜索会匹配 JSON 键、路径、CLI 参数和 Compose 键。",
	"home.searchPlaceholder":
		"MemoryBytes、rollback、--limit-cpu、deploy.resources…",
	"preset.kicker": "从预设开始",
	"preset.title": "常见更新形状",
	"preset.clear": "清空全部",
	"preset.orTick": "也可以直接勾选下面的字段。只有启用的字段会进入生成对象。",
	"section.set": "已设置",
	"section.hide": "收起",
	"section.show": "展开",
	"field.unset": "— 未设置 —",
	"field.unit": "单位",
	"field.serializes": "序列化为",
	"field.empty": "为空，此键不会出现在生成对象中。",
	"field.hideExplanation": "隐藏说明",
	"field.whatDoesThisDo": "这有什么作用？",
	"field.apiDefault": "API 默认值",
	"field.cli": "CLI",
	"field.compose": "Compose",
	"rows.noEntries": "还没有条目，此键不会出现在输出中。",
	"rows.unset": "未设置",
	"rows.remove": "移除",
	"rows.addEntry": "添加条目",
	"output.generated": "生成对象",
	"output.fieldsIncluded": "已包含 {count} 个字段",
	"output.copy": "复制",
	"output.download": "下载",
	"output.copyPermalink": "复制固定链接",
	"output.jsonHint": "可直接 POST 的请求体。",
	"output.yamlHint": "相同的对象，更适合在 PR 中审阅。",
	"output.curlHint": "通过 Docker socket 完成读取、合并和写入的完整流程。",
	"output.endpoint": "端点：",
	"output.apiReference": "ServiceUpdate 参考",
	"copy.copied": "已复制",
	"copy.blocked": "复制被阻止",
	"review.title": "检查",
	"review.none": "当前选择没有检测到冲突。",
	"review.thingsToCheck": "有 {count} 项需要检查",
	"review.error": "请求会被拒绝",
	"review.warning": "可能是错误配置",
	"review.info": "值得了解",
	"reading.kicker": "字段指南",
	"reading.start": "从这里开始",
	"reading.background": "当前配置的背景知识",
	"reading.loading": "加载中…",
	"about.kicker": "关于",
	"about.title": "一个针对特定 JSON 对象的可视化编辑器。",
	"about.intro":
		"Docker Engine API 的 ServiceUpdate 请求体层级很深、没有单位提示，也很容易出错。本构建器覆盖 Engine API {version} 的 {sections} 个分组、{fields} 个字段，用通俗语言解释每个字段，并导出 JSON、YAML 或可运行的 curl 脚本。",
	"about.howItWorks": "工作方式",
	"about.how1":
		"每个字段都以数据形式描述在 src/docker/catalog/ 中，包括 JSON 路径、编辑器类型、说明、CLI 参数和 Compose 对应项。增加覆盖范围只需修改数据，不需要改组件。",
	"about.how2":
		"数字使用人类熟悉的单位编辑，然后序列化为 API 所需的原始标量：纳秒、字节和 nano-CPU。",
	"about.how3":
		"只有勾选的字段会被输出，因此结果是可用的 diff，而不是完整 spec。",
	"about.how4":
		"跨字段检查会标出 daemon 会拒绝的组合，例如 dnsrr 与发布端口、start-first 与 host 模式端口、预留资源超过限制等。",
	"about.how5": "{count} 个预设代表完整且可解释的配置，而不是孤立字段。",
	"about.scope": "范围与边界",
	"about.scopeText":
		"本应用不会连接 Docker daemon。它没有后端、不保存凭据，也不能替你执行任何操作，只会生成供你审阅和运行的文本。这是有意为之：服务更新最危险的部分是合并，而隐藏合并过程的工具还不如没有。",
	"about.apiLink": "Engine API {version} — ServiceUpdate 参考",
	"blog.kicker": "字段指南",
	"blog.title": "Schema 没有告诉你的那些事。",
	"blog.intro":
		"Engine API 参考会告诉你每个键的类型，却不会告诉你接口会替换整个 spec、持续时间使用纳秒，或为什么滚动更新会悄悄丢连接。这些文章会告诉你。",
	"blog.reading": "阅读约 {minutes} 分钟",
	"blog.configure": "配置它",
	"blog.configureText": "构建器中覆盖本文内容的分组：",
	"blog.allPosts": "← 全部文章",
	"blog.noPost": "文章不存在",
	"blog.noPostText": "这个 slug 不属于字段指南。",
	"blog.backToGuide": "返回字段指南",
	"theme.light": "浅色",
	"theme.dark": "深色",
	"theme.auto": "自动",
	"theme.autoDescription": "主题：自动（跟随系统）。点击切换为浅色。",
	"theme.modeDescription": "主题：{mode}。点击切换为{next}。",
	"section.service": "服务标识",
	"section.mode": "调度模式",
	"section.container": "容器配置",
	"section.health": "健康检查",
	"section.storage": "挂载、密钥与配置",
	"section.resources": "资源",
	"section.restart": "重启策略",
	"section.placement": "放置规则",
	"section.network": "网络",
	"section.task-misc": "任务模板附加项",
	"section.update-config": "更新配置（发布策略）",
	"section.rollback-config": "回滚配置",
	"section.request": "请求选项",
	"preset.memory-limit": "提高内存限制",
	"preset.zero-downtime": "零停机发布",
	"preset.scale": "调整副本数",
	"preset.force-redeploy": "强制重新部署",
	"preset.hardened": "加固容器",
	"preset.manual-rollback": "手动回滚",
};

const POST_TEXT_ZH: Record<string, { title: string; summary: string }> = {
	"partial-service-spec-is-a-trap": {
		title: "不完整的 ServiceSpec 是个陷阱",
		summary:
			'为什么 {"TaskTemplate":{"Resources":{"Limits":{"MemoryBytes":12884901888}}}} 会删除镜像，以及应该发送什么。',
	},
	"reading-docker-units": {
		title: "纳秒、nano-CPU 与原始字节",
		summary:
			"Engine API 没有单位后缀。这里说明每个数字字段如何转换，以及舍入会在哪里造成影响。",
	},
	"zero-downtime-rollouts": {
		title: "真正实现零停机发布的条件",
		summary:
			"UpdateConfig、健康检查和停止宽限期是一个整体。只设置其中一个并没有用。",
	},
	"rollback-mechanics": {
		title: "回滚：只有一层 spec，而且这是有意的",
		summary:
			"Swarm 只保留一个 PreviousSpec。这对自动回滚、手动回滚和 registry 凭据意味着什么。",
	},
};

export function localizedPostText(
	slug: string,
	locale: Locale,
	fallback: { title: string; summary: string },
) {
	return locale === "zh-CN" ? (POST_TEXT_ZH[slug] ?? fallback) : fallback;
}

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
	en: EN,
	"zh-CN": ZH,
};

function isLocale(value: string | null): value is Locale {
	return value === "en" || value === "zh-CN";
}

function browserLocale(): Locale {
	return typeof navigator !== "undefined" &&
		navigator.language.toLowerCase().startsWith("zh")
		? "zh-CN"
		: "en";
}

function preferredLocale(): Locale {
	if (typeof window === "undefined") return "en";

	try {
		const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
		if (isLocale(stored)) return stored;
	} catch {
		// Storage can be unavailable in private browsing or locked-down contexts.
	}

	return browserLocale();
}

function setDocumentLocale(locale: Locale) {
	if (typeof document !== "undefined") {
		document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
	}
}

function formatMessage(
	template: string,
	values?: Record<string, string | number>,
): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		values?.[key] === undefined ? match : String(values[key]),
	);
}

interface I18nContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: MessageKey, values?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>("en");

	useEffect(() => {
		setLocaleState(preferredLocale());
	}, []);

	useEffect(() => {
		setDocumentLocale(locale);
	}, [locale]);

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next);
		setDocumentLocale(next);
		try {
			window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
		} catch {
			// The UI still changes when persistence is unavailable.
		}
	}, []);

	const value = useMemo<I18nContextValue>(
		() => ({
			locale,
			setLocale,
			t: (key, values) => formatMessage(MESSAGES[locale][key], values),
		}),
		[locale, setLocale],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (!context) throw new Error("useI18n must be used within I18nProvider");
	return context;
}

export type { MessageKey };

export const LANGUAGE_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('language');var language=stored==='zh-CN'||stored==='en'?stored:(navigator.language||'').toLowerCase().indexOf('zh')===0?'zh-CN':'en';document.documentElement.lang=language;}catch(e){}})();`;
