import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import type { CustomerWarehouse } from "../hooks/use-warehouse-settings-form";

type SelectedWarehouseItemProps = {
	warehouse: CustomerWarehouse;
	onRemove: (id: string) => void;
};

export function SelectedWarehouseItem({ warehouse, onRemove }: SelectedWarehouseItemProps) {
	return (
		<div className="flex items-center justify-between p-3 bg-sky-50/50 border border-sky-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-center gap-3">
				<div className="flex flex-col">
					<Text variant="body2" className="font-semibold text-sky-900 leading-tight">
						{warehouse.warehouseName}
					</Text>
					<div className="flex items-center gap-1.5 mt-0.5">
						<div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
						<Text className="text-[9px] text-sky-600 font-bold uppercase tracking-widest">Current Assignment</Text>
					</div>
				</div>
			</div>
			<div className="flex items-center gap-1.5">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => onRemove(warehouse.warehouseId)}
					className="text-red-500 hover:text-red-600 hover:bg-red-100 rounded-full h-8 w-8"
					title="Remove assignment"
				>
					<Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
