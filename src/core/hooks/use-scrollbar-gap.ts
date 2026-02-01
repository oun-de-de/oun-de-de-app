import { useEffect, useState } from "react";

// ============================================================================
// Constants
// ============================================================================

/** Default gap (in pixels) when classic scrollbars are detected */
const DEFAULT_SCROLLBAR_GAP = 12;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Measures the width of the browser's scrollbar.
 *
 * How it works:
 * 1. Create a hidden container with overflow: scroll
 * 2. Add a child element inside
 * 3. Measure the difference between container width and child width
 * 4. This difference = scrollbar width
 *
 * @returns Scrollbar width in pixels (0 for overlay scrollbars like macOS)
 */
function measureScrollbarWidth(): number {
	// Create container with forced scrollbar
	const container = document.createElement("div");
	container.style.cssText = `
    visibility: hidden;
    position: absolute;
    top: -9999px;
    width: 100px;
    height: 100px;
    overflow: scroll;
  `;

	// Create inner content that fills the container
	const content = document.createElement("div");
	content.style.cssText = `
    width: 100%;
    height: 100%;
  `;

	// Append to DOM for measurement
	container.appendChild(content);
	document.body.appendChild(container);

	// Calculate scrollbar width
	// Container's clientWidth excludes scrollbar, offsetWidth includes it
	const scrollbarWidth = container.offsetWidth - content.offsetWidth;

	// Cleanup
	document.body.removeChild(container);

	return scrollbarWidth;
}

/**
 * Checks if the browser uses overlay scrollbars.
 *
 * Overlay scrollbars (default on macOS):
 * - Appear on top of content when scrolling
 * - Don't take up any space
 * - Scrollbar width = 0
 *
 * Classic scrollbars (Windows, Linux):
 * - Always visible when content overflows
 * - Take up space (typically 12-17px)
 * - Scrollbar width > 0
 */
function hasOverlayScrollbar(): boolean {
	return measureScrollbarWidth() === 0;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Detects whether the browser uses overlay scrollbars.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isOverlay = useOverlayScrollbar();
 *   // isOverlay = true on macOS, false on Windows/Linux
 * }
 * ```
 */
export function useOverlayScrollbar(): boolean {
	const [isOverlay, setIsOverlay] = useState(false);

	useEffect(() => {
		// Re-check on mount in case environment differs (rare but safe)
		if (typeof window === "undefined") return;
		setIsOverlay(hasOverlayScrollbar());
	}, []);

	return isOverlay;
}

/**
 * Returns appropriate scrollbar gap based on browser type.
 *
 * - Overlay scrollbars (macOS): returns 0 (no gap needed)
 * - Classic scrollbars (Windows/Linux): returns `defaultGap`
 *
 * @param defaultGap - Gap size for classic scrollbars (default: 12px)
 * @returns Scrollbar gap in pixels
 *
 * @example
 * ```tsx
 * function VirtualList() {
 *   const gap = useScrollbarGap(); // 0 on macOS, 12 on Windows
 *
 *   return (
 *     <div style={{ width: `calc(100% - ${gap}px)` }}>
 *       {items}
 *     </div>
 *   );
 * }
 * ```
 */
export function useScrollbarGap(defaultGap = DEFAULT_SCROLLBAR_GAP): number {
	const isOverlay = useOverlayScrollbar();

	// No gap needed for overlay scrollbars since they float above content
	return isOverlay ? 0 : defaultGap;
}
