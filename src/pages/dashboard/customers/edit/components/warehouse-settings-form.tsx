import { useState } from "react";
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
	const form = useWarehouseSettingsForm(customerId, currentWarehouseId);
	const [searchTerm, setSearchTerm] = useState("");

	const filteredAvailable = form.availableWarehouses.filter((w) =>
		w.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (form.isLoading) {
		return <div>Loading warehouses...</div>;
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-end">
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild size="sm">
						<Link to="/dashboard/settings" state={{ tab: "warehouse" }}>
							<Icon icon="mdi:plus" className="w-4 h-4 mr-1" />
							Create Warehouse
						</Link>
					</Button>
					<Button onClick={form.handleSave} disabled={form.isSaving} size="sm">
						{form.isSaving ? "Saving..." : "Save Settings"}
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card className="flex flex-col py-0 border-dashed border lg:border-solid lg:border overflow-hidden bg-gray-50/20">
					<CardHeader className="py-2.5 px-3 border-b bg-gray-50/80">
						<CardTitle className="text-[11px] font-bold text-gray-600 uppercase tracking-widest text-center w-full">
							Available Options
						</CardTitle>
					</CardHeader>
					<div className="px-3 pt-3">
						<div className="relative">
							<Icon icon="mdi:magnify" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search warehouses..."
								className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-all"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<CardContent className="p-2 space-y-1 flex-1 overflow-auto">
						{filteredAvailable.length === 0 ? (
							<div className="flex flex-col items-center justify-center p-8 gap-2 text-center text-gray-400">
								<Icon icon="mdi:warehouse-off" className="w-8 h-8 opacity-20" />
								<Text variant="caption">
									{searchTerm ? "No matching warehouses found" : "No other options available"}
								</Text>
							</div>
						) : (
							filteredAvailable.map((warehouse) => (
								<AvailableWarehouseItem key={warehouse.id} warehouse={warehouse} onAdd={form.handleAdd} />
							))
						)}
					</CardContent>
				</Card>

				<div>
					<Card className="border shadow-sm overflow-hidden flex flex-col py-0">
						<CardHeader className="py-2.5 px-3 border-b bg-gray-50/50 flex items-center justify-center">
							<CardTitle className="text-[11px] font-bold text-gray-600 uppercase tracking-widest text-center w-full">
								Customer Assignment
							</CardTitle>
						</CardHeader>
						<CardContent className="p-2 flex flex-col flex-1 min-h-[120px]">
							{!form.selectedWarehouse ? (
								<div className="flex flex-col items-center justify-center flex-1 gap-3 text-center text-gray-400">
									<Icon icon="mdi:package-variant-closed" className="w-10 h-10 opacity-20" />
									<div className="space-y-0.5">
										<Text variant="caption" className="font-semibold text-gray-500 uppercase">
											No warehouse assigned
										</Text>
										<Text className="text-[10px]">Select an option on the left to assign a warehouse.</Text>
									</div>
								</div>
							) : (
								<div className="w-full px-1 pt-1">
									<SelectedWarehouseItem warehouse={form.selectedWarehouse as any} onRemove={form.handleRemove} />
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
