import { Link } from "react-router";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { Text } from "@/core/ui/typography";
import { useWarehouseSettingsForm } from "../hooks/use-warehouse-settings-form";
import { AvailableWarehouseItem } from "./available-warehouse-item";
import { SelectedWarehouseItem } from "./selected-warehouse-item";

type WarehouseSettingsFormProps = {
	customerId?: string;
	currentWarehouseId?: string;
};

export function WarehouseSettingsForm({ customerId, currentWarehouseId }: WarehouseSettingsFormProps) {
	const { selectedWarehouse, availableWarehouses, isLoading, isSaving, handleAdd, handleRemove, handleSave } =
		useWarehouseSettingsForm(customerId, currentWarehouseId);

	if (isLoading) {
		return <div>Loading warehouses...</div>;
	}

	return (
		<div className="space-y-4 h-full">
			<div className="flex items-center justify-between">
				<Text className="font-semibold text-sky-600">Warehouse Settings</Text>
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link to="/dashboard/settings" state={{ tab: "warehouse" }}>
							<Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
							Create Warehouse
						</Link>
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? "Saving..." : "Save Settings"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Available Warehouses</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 h-full">
						{availableWarehouses.length === 0 ? (
							<Text variant="caption" className="text-gray-500 flex items-center justify-center h-full w-full">
								No warehouses available
							</Text>
						) : (
							availableWarehouses.map((warehouse, index) => (
								<AvailableWarehouseItem key={warehouse.id} warehouse={warehouse} index={index} onAdd={handleAdd} />
							))
						)}
					</CardContent>
				</Card>

				<div className="h-full md:col-span-2">
					<Card className="h-full">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Customer Warehouses</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 h-full">
							{!selectedWarehouse ? (
								<Text variant="caption" className="text-gray-500 flex items-center justify-center w-full h-full">
									No warehouses assigned. Click on available warehouses to add.
								</Text>
							) : (
								<SelectedWarehouseItem warehouse={selectedWarehouse} onRemove={handleRemove} />
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
