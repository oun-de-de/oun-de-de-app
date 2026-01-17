import { useSettings } from "@/core/store/settingStore";
import { useEffect, useMemo } from "react";
import { HtmlDataAttribute } from "@/core/types/enum";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { baseThemeTokens } from "./tokens/base";
import { darkColorTokens, lightColorTokens, presetsColors } from "./tokens/color";
import { darkShadowTokens, lightShadowTokens } from "./tokens/shadow";
import { typographyTokens } from "./tokens/typography";
import type { UILibraryAdapter } from "./type";

interface ThemeProviderProps {
	children: React.ReactNode;
	adapters?: UILibraryAdapter[];
}

export function ThemeProvider({ children, adapters = [] }: ThemeProviderProps) {
	const { themeMode, themeColorPresets, fontFamily, fontSize } = useSettings();

	// Create theme object for styled-components
	const styledTheme = useMemo(() => {
		let colorTokens = themeMode === "light" ? lightColorTokens : darkColorTokens;

		colorTokens = {
			...colorTokens,
			palette: {
				...colorTokens.palette,
				primary: presetsColors[themeColorPresets],
			},
		};

		return {
			mode: themeMode,
			colors: colorTokens,
			typography: typographyTokens,
			shadows: themeMode === "light" ? lightShadowTokens : darkShadowTokens,
			...baseThemeTokens,
		};
	}, [themeMode, themeColorPresets]);

	// Update HTML class to support Tailwind dark mode
	useEffect(() => {
		const root = window.document.documentElement;
		root.setAttribute(HtmlDataAttribute.ThemeMode, themeMode);
	}, [themeMode]);

	// Dynamically update theme color related CSS variables
	useEffect(() => {
		const root = window.document.documentElement;
		root.setAttribute(HtmlDataAttribute.ColorPalette, themeColorPresets);
	}, [themeColorPresets]);

	// Update font size and font family
	useEffect(() => {
		const root = window.document.documentElement;
		root.style.fontSize = `${fontSize}px`;

		const body = window.document.body;
		body.style.fontFamily = fontFamily;
	}, [fontFamily, fontSize]);

	// Wrap children with adapters
	const wrappedWithAdapters = adapters.reduce(
		(children, Adapter) => (
			<Adapter key={Adapter.name} mode={themeMode}>
				{children}
			</Adapter>
		),
		children,
	);

	return <StyledThemeProvider theme={styledTheme}>{wrappedWithAdapters}</StyledThemeProvider>;
}
