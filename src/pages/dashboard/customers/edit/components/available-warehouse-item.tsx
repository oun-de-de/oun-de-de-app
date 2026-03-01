import Icon from "@/core/components/icon/icon";
import type { Warehouse } from "@/core/types/setting";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";

type AvailableWarehouseItemProps = {
	warehouse: Warehouse;
	onAdd: (warehouse: Warehouse) => void;
};

export function AvailableWarehouseItem({ warehouse, onAdd }: AvailableWarehouseItemProps) {
	return (
		<Button
			type="button"
			variant="ghost"
			className="flex w-full items-center gap-2 p-2 h-auto bg-gray-50 border border-transparent rounded-lg hover:bg-sky-50 hover:border-sky-100 transition-all duration-200 group text-left"
			onClick={() => onAdd(warehouse)}
		>
			<div className="flex flex-col flex-1 min-w-0 px-2">
				<Text variant="caption" className="font-medium text-gray-900 truncate">
					{warehouse.name}
				</Text>
				{warehouse.location && <Text className="text-[10px] text-gray-500 truncate mt-0.5">{warehouse.location}</Text>}
			</div>
			<div className="opacity-0 group-hover:opacity-100 transition-opacity bg-sky-100 text-sky-600 rounded-full p-1">
				<Icon icon="mdi:plus" className="w-3.5 h-3.5" />
			</div>
		</Button>
	);
}
