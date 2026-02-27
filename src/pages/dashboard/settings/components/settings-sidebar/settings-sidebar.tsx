import { settingsLeftMenu } from "@/_mock/data/dashboard";
import { SidebarList } from "@/core/components/common";
import { cn } from "@/core/utils";
import { MenuItem } from "./menu-item";

export type SettingsSidebarProps = {
	activeItem: string;
	onSelect: (item: string) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
};

export function SettingsSidebar({ activeItem, onSelect, onToggle, isCollapsed }: SettingsSidebarProps) {
	return (
		<SidebarList>
			<div className="flex items-center justify-between px-2 pb-4">
				<div className={cn("flex items-center gap-2", isCollapsed && "hidden")}>
					<h4 className="text-lg font-semibold">Settings</h4>
				</div>
				<SidebarList.ToggleButton onClick={onToggle} isCollapsed={isCollapsed} variant="outline" />
			</div>

			<nav className={cn("flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1", isCollapsed && "items-center")}>
				{settingsLeftMenu.map((item) => (
					<MenuItem
						key={item}
						label={item}
						isActive={activeItem === item}
						onSelect={onSelect}
						isCollapsed={isCollapsed}
					/>
				))}
			</nav>
		</SidebarList>
	);
}
