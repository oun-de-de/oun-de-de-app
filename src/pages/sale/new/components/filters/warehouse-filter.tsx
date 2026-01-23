import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FilterField } from "./filter-field";

const WAREHOUSES = ["Warehouse A", "Warehouse B", "Warehouse C"];

interface WarehouseFilterProps {
	value: string;
	onChange: (value: string) => void;
}

export function WarehouseFilter({ value, onChange }: WarehouseFilterProps) {
	return (
		<FilterField label="Warehouse" required>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger>
					<SelectValue placeholder="Warehouse" />
				</SelectTrigger>
				<SelectContent>
					{WAREHOUSES.map((warehouse) => (
						<SelectItem key={warehouse} value={warehouse}>
							{warehouse}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterField>
	);
}
