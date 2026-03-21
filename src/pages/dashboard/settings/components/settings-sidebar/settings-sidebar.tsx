import { SidebarList } from "@/core/components/common";
import { cn } from "@/core/utils";
import { MenuItem } from "./menu-item";
import { Separator } from "@/core/ui/separator";

export type SettingsSidebarProps = {
	items: string[];
	activeItem: string;
	onSelect: (item: string) => void;
	onToggle?: () => void;
	isCollapsed?: boolean;
	title?: string;
};

const SETTINGS_ITEM_ICONS: Record<string, string> = {
	Unit: "mdi:ruler-square",
	Warehouse: "mdi:warehouse",
	Currency: "mdi:currency-usd",
	"Chart of Accounts": "mdi:family-tree",
	"Journal Class": "mdi:shape-outline",
	"Journal Type": "mdi:book-open-page-variant-outline",
	"Account Type": "mdi:file-cog-outline",
	"Payment Method": "mdi:credit-card-outline",
	Advance: "mdi:cash-fast",
	"Invoice Template": "mdi:file-document-edit-outline",
	"Import Data": "mdi:database-import-outline",
};

export function SettingsSidebar({
	items,
	activeItem,
	onSelect,
	onToggle,
	isCollapsed,
	title = "Settings",
}: SettingsSidebarProps) {
	const collapsedHint = `Click to expand ${activeItem.toLowerCase()} settings`;

	if (isCollapsed) {
		return (
			<SidebarList className="relative">
				<div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
					<SidebarList.ToggleButton onClick={onToggle} isCollapsed={isCollapsed} variant="default" />
				</div>
				<SidebarList.CollapsedHint text={collapsedHint} onClick={onToggle} className="pb-0 pt-0" />
			</SidebarList>
		);
	}

	return (
		<SidebarList>
			<div className="flex items-center justify-between pb-2 px-2">
				<div className={cn("flex items-center gap-2")}>
					<h6 className="text-normal font-semibold">{title}</h6>
				</div>
				<SidebarList.ToggleButton onClick={onToggle} isCollapsed={isCollapsed} variant="default" />
			</div>

			<Separator className="mb-2" />

			<nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-1">
				{items.map((item) => (
					<MenuItem
						key={item}
						label={item}
						isActive={activeItem === item}
						onSelect={onSelect}
						icon={SETTINGS_ITEM_ICONS[item]}
					/>
				))}
			</nav>
		</SidebarList>
	);
}
