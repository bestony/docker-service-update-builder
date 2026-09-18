import { Button } from "@cloudflare/kumo";
import { CircleHalfIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useT } from "#/i18n/locale-context";
import type { MessageKey } from "#/i18n/translate";

type ThemeMode = "light" | "dark" | "auto";

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
	light: "dark",
	dark: "auto",
	auto: "light",
};

const ICON = {
	light: SunIcon,
	dark: MoonIcon,
	auto: CircleHalfIcon,
} as const;

const LABEL_KEY: Record<ThemeMode, MessageKey> = {
	light: "theme.light",
	dark: "theme.dark",
	auto: "theme.auto",
};

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}

	return "auto";
}

/**
 * Kumo's palette resolves through CSS `light-dark()`, so the resolved mode has
 * to land on both `color-scheme` and `data-mode`: the first drives the token
 * values, the second drives Kumo's explicit dark overrides. This mirrors the
 * inline boot script in `__root.tsx` — keep the two in step.
 */
function applyThemeMode(mode: ThemeMode) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;

	document.documentElement.setAttribute("data-mode", resolved);
	document.documentElement.style.colorScheme = resolved;
}

export default function ThemeToggle() {
	const t = useT();
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		const initialMode = getInitialMode();
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, []);

	useEffect(() => {
		if (mode !== "auto") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyThemeMode("auto");

		media.addEventListener("change", onChange);
		return () => {
			media.removeEventListener("change", onChange);
		};
	}, [mode]);

	function toggleMode() {
		const nextMode = NEXT_MODE[mode];
		setMode(nextMode);
		applyThemeMode(nextMode);
		window.localStorage.setItem("theme", nextMode);
	}

	const currentLabel = t(LABEL_KEY[mode]);
	const label =
		mode === "auto"
			? t("theme.switchAuto")
			: t("theme.switch", {
					mode: currentLabel,
					next: t(LABEL_KEY[NEXT_MODE[mode]]),
				});

	return (
		<Button
			variant="secondary"
			size="sm"
			icon={ICON[mode]}
			onClick={toggleMode}
			aria-label={label}
			title={label}
		>
			<span className="theme-toggle__label">{currentLabel}</span>
		</Button>
	);
}
