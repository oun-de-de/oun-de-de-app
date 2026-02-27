import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";

type EquipmentQuickActionsProps = {
	onPrintReport?: () => void;
	onExport?: () => void;
	onDuplicate?: () => void;
	onArchive?: () => void;
};

export function EquipmentQuickActions({ onPrintReport, onExport, onDuplicate, onArchive }: EquipmentQuickActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size="sm" variant="outline">
					<Icon icon="mdi:dots-vertical" className="mr-1" />
					Actions
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={onPrintReport}>
					<Icon icon="mdi:printer" className="mr-2" />
					Print Report
				</DropdownMenuItem>
				<DropdownMenuItem onClick={onExport}>
					<Icon icon="mdi:download" className="mr-2" />
					Export Data
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={onDuplicate}>
					<Icon icon="mdi:content-copy" className="mr-2" />
					Duplicate Item
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={onArchive} className="text-red-600">
					<Icon icon="mdi:archive" className="mr-2" />
					Archive Item
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
