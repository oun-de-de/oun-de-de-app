import type { ReactNode } from "react";
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

// Subcomponents attached to the namespace
SidebarList.Header = SidebarListHeader;
SidebarList.Body = VirtualList;
SidebarList.Footer = ListFooter;
