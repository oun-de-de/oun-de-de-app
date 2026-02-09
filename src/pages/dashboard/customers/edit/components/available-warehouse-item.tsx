import Icon from "@/core/components/icon/icon";
import type { Warehouse } from "@/core/types/setting";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";

type AvailableWarehouseItemProps = {
	warehouse: Warehouse;
	index: number;
	onAdd: (warehouse: Warehouse) => void;
};

export function AvailableWarehouseItem({ warehouse, index, onAdd }: AvailableWarehouseItemProps) {
	return (
		<Button
			type="button"
			className="flex w-full items-center gap-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer text-left"
			onClick={() => onAdd(warehouse)}
		>
			<Text variant="caption" className="text-gray-500 w-6 shrink-0">
				{index + 1}
			</Text>
			<Text variant="body2" className="font-medium flex-1">
				{warehouse.name}
			</Text>
			{warehouse.location && (
				<Text variant="caption" className="text-gray-500">
					{warehouse.location}
				</Text>
			)}
			<Icon icon="mdi:plus" className="w-4 h-4 text-sky-600 shrink-0" />
		</Button>
	);
}
