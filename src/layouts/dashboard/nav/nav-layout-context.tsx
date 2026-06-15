import { createContext, useContext, useMemo } from "react";
import { ThemeLayout } from "@/core/types/enum";

/**
 * React context for nav layout state (mini vs vertical).
 *
 * WHY context over Zustand for this:
 * - Pure UI state (toggle sidebar width), not app domain state
 * - Only 4 nav components consume it — all in the same subtree
 * - Reduces subscriptions from 4 separate Zustand `useSettings()` calls to 1
 * - Zustand is overkill for a single boolean + toggle function
 *
 * The Zustand store still owns `themeLayout` — this context bridges the
 * derived `isMini` value down to the nav subtree so components don't
 * individually subscribe to the global store.
 */

export interface NavLayoutState {
	readonly isMini: boolean;
	readonly toggleLayout: () => void;
}

const NavLayoutContext = createContext<NavLayoutState | null>(null);

export function useNavLayout(): NavLayoutState {
	const ctx = useContext(NavLayoutContext);
	if (!ctx) {
		throw new Error("useNavLayout must be used within a NavLayoutProvider");
	}
	return ctx;
}

interface NavLayoutProviderProps {
	readonly themeLayout: ThemeLayout;
	readonly onToggle: () => void;
	readonly children: React.ReactNode;
}

export function NavLayoutProvider({ themeLayout, onToggle, children }: NavLayoutProviderProps) {
	const value = useMemo<NavLayoutState>(
		() => ({
			isMini: themeLayout === ThemeLayout.Mini,
			toggleLayout: onToggle,
		}),
		[themeLayout, onToggle],
	);

	return <NavLayoutContext.Provider value={value}>{children}</NavLayoutContext.Provider>;
}
