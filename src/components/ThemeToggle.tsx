import { Button } from "@cloudflare/kumo";
import { CircleHalfIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

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

const LABEL: Record<ThemeMode, string> = {
	light: "Light",
	dark: "Dark",
	auto: "Auto",
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

	const label =
		mode === "auto"
			? "Theme: auto (follows the system). Click to switch to light."
			: `Theme: ${mode}. Click to switch to ${NEXT_MODE[mode]}.`;

	return (
		<Button
			variant="secondary"
			size="sm"
			icon={ICON[mode]}
			onClick={toggleMode}
			aria-label={label}
			title={label}
		>
			<span className="theme-toggle__label">{LABEL[mode]}</span>
		</Button>
	);
}
