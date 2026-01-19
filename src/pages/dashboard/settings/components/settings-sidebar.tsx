import { settingsLeftMenu } from "@/_mock/data/dashboard";
import { SidebarList } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";

type SettingsSidebarProps = {
	activeItem: string;
	onSelect: (item: string) => void;
};

export function SettingsSidebar({ activeItem, onSelect }: SettingsSidebarProps) {
	return (
		<SidebarList>
			<div className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0 p-1">
				{settingsLeftMenu.map((item) => (
					<Button
						key={item}
						variant="ghost"
						className={cn(
							"justify-start tracking-wide transition-all transform hover:scale-105 hover:shadow-xs",
							activeItem === item && "bg-sky-600 text-base text-white hover:bg-sky-600/90",
						)}
						size="sm"
						onClick={() => onSelect(item)}
					>
						<Icon
							icon={activeItem === item ? "mdi:checkbox-blank-circle" : "mdi:checkbox-blank-circle-outline"}
							className="mr-2 text-xs"
						/>
						{item}
					</Button>
				))}
			</div>
		</SidebarList>
	);
}
