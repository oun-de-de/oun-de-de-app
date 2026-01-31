import { useCallback, useEffect, useState } from "react";
import { up, useMediaQuery } from "@/core/hooks/use-media-query";

type UseSidebarCollapseResult = {
	isCollapsed: boolean;
	handleToggle: () => void;
	canCollapse: boolean;
};

/**
 * Hook to manage sidebar collapse state with responsive behavior.
 * - On desktop (lg+): allows collapse/expand toggle
 * - On mobile (<lg): always expanded, toggle disabled
 * - Auto-resets to expanded when resizing from desktop to mobile
 */
export function useSidebarCollapse(): UseSidebarCollapseResult {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const isLgUp = useMediaQuery(up("lg"));

	// Auto-reset to expanded when switching to mobile
	useEffect(() => {
		if (!isLgUp && isCollapsed) {
			setIsCollapsed(false);
		}
	}, [isLgUp, isCollapsed]);

	// Only allow toggle on desktop
	const handleToggle = useCallback(() => {
		if (isLgUp) {
			setIsCollapsed((prev) => !prev);
		}
	}, [isLgUp]);

	return {
		isCollapsed: isLgUp ? isCollapsed : false,
		handleToggle,
		canCollapse: isLgUp,
	};
}
