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
		<div className="flex items-center justify-between p-3 bg-gray-50 rounded-md h-full">
			<div className="flex items-center gap-3">
				<Text variant="body2" className="font-medium">
					{warehouse.warehouseName}
				</Text>
			</div>
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" onClick={() => onRemove(warehouse.warehouseId)}>
					<Icon icon="mdi:trash-can-outline" className="w-4 h-4 text-red-500" />
				</Button>
			</div>
		</div>
	);
}
