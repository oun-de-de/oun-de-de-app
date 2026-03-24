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

type SidebarCollapsedHintProps = {
	text: string;
	onClick?: () => void;
	className?: string;
};

// Root Component
export function SidebarList({ children, className }: SidebarListProps) {
	return <div className={cn("relative flex h-full min-h-0 flex-col", className)}>{children}</div>;
}

// Shared Toggle Button Component
type SidebarToggleButtonProps = {
	onClick?: () => void;
	isCollapsed?: boolean;
	variant?: "ghost" | "outline" | "info" | "default";
	className?: string;
};

export function SidebarToggleButton({ onClick, isCollapsed, variant = "info", className }: SidebarToggleButtonProps) {
	return (
		<Button
			variant={variant}
			size="icon"
			className={cn("h-8 w-8 shrink-0 hidden lg:block", className)}
			onClick={onClick}
			aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
	variant?: "ghost" | "outline" | "info";
};

function SidebarListToggle({ onToggle, isCollapsed, className, variant }: SidebarListToggleProps) {
	return (
		<div className={cn("flex items-center justify-end p-2 border-b border-gray-100 mb-2", className)}>
			<SidebarToggleButton onClick={onToggle} isCollapsed={isCollapsed} variant={variant} />
		</div>
	);
}

function SidebarCollapsedHint({ text, onClick, className }: SidebarCollapsedHintProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex min-h-0 flex-1 items-center justify-center px-1 py-3 text-center text-xs text-slate-500 transition-colors hover:text-slate-700",
				className,
			)}
			title={text}
		>
			<span className="[writing-mode:vertical-rl] [text-orientation:mixed]">{text}</span>
		</button>
	);
}

// Subcomponents attached to the namespace
SidebarList.Header = SidebarListHeader;
SidebarList.Body = VirtualList;
SidebarList.Footer = ListFooter;
SidebarList.Toggle = SidebarListToggle;
SidebarList.ToggleButton = SidebarToggleButton;
SidebarList.CollapsedHint = SidebarCollapsedHint;
