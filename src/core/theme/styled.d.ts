import "styled-components";
import type { ThemeMode } from "@/core/types/enum";
import type { baseThemeTokens } from "./tokens/base";
import type { darkColorTokens, lightColorTokens } from "./tokens/color";
import type { darkShadowTokens, lightShadowTokens } from "./tokens/shadow";
import type { typographyTokens } from "./tokens/typography";

declare module "styled-components" {
	export interface DefaultTheme {
		mode: ThemeMode;
		colors: typeof darkColorTokens | typeof lightColorTokens;
		typography: typeof typographyTokens;
		shadows: typeof darkShadowTokens | typeof lightShadowTokens;
		spacing: typeof baseThemeTokens.spacing;
		borderRadius: typeof baseThemeTokens.borderRadius;
		zIndex: typeof baseThemeTokens.zIndex;
	}
}