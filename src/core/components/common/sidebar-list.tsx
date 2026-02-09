import type { ReactNode } from "react";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";
import { ListFooter } from "./list-footer";
import { SidebarListHeader } from "./sidebar-list-header";
import { VirtualList } from "./virtual-list/virtual-list";

type SidebarListProps = {
	children: ReactNode;
	className?: string;
};

// Root Component
export function SidebarList({ children, className }: SidebarListProps) {
	return <div className={cn("flex flex-col h-full", className)}>{children}</div>;
}

// Shared Toggle Button Component
type SidebarToggleButtonProps = {
	onClick?: () => void;
	isCollapsed?: boolean;
	variant?: "ghost" | "outline";
	className?: string;
};

export function SidebarToggleButton({ onClick, isCollapsed, variant = "ghost", className }: SidebarToggleButtonProps) {
	return (
		<Button
			variant={variant}
			size="icon"
			className={cn("h-9 w-9 shrink-0 hidden lg:block", className)}
			onClick={onClick}
		>
			<Icon icon={isCollapsed ? "mdi:menu-open" : "mdi:menu"} />
		</Button>
	);
}

// Toggle section that wraps the button with container styling
type SidebarListToggleProps = {
	onToggle?: () => void;
	isCollapsed?: boolean;
	className?: string;
	variant?: "ghost" | "outline";
};

function SidebarListToggle({ onToggle, isCollapsed, className, variant }: SidebarListToggleProps) {
	return (
		<div className={cn("flex items-center justify-end p-2 border-b border-gray-100 mb-2", className)}>
			<SidebarToggleButton onClick={onToggle} isCollapsed={isCollapsed} variant={variant} />
		</div>
	);
}

// Subcomponents attached to the namespace
SidebarList.Header = SidebarListHeader;
SidebarList.Body = VirtualList;
SidebarList.Footer = ListFooter;
SidebarList.Toggle = SidebarListToggle;
SidebarList.ToggleButton = SidebarToggleButton;
