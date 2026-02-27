import { useState } from "react";
import { toast } from "sonner";
import { settingsRows } from "@/_mock/data/dashboard";
import { SmartDataTable } from "@/core/components/common";
import type { SettingsRow } from "@/core/types/common";
import type { UnitType } from "@/core/types/setting";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Text } from "@/core/ui/typography";
import { useCreateUnit, useCreateWarehouse, useGetUnitList, useGetWarehouseList } from "../hooks/use-settings";
import { useFormState, useSettingsSidebarActions } from "../stores";
import { getColumnsForItem } from "./settings-columns";
import { SettingsForm } from "./settings-form/settings-form";

type SettingsContentProps = {
	activeItem: string;
};

export function SettingsContent({ activeItem }: SettingsContentProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const { showForm, editItem, formMode } = useFormState();
	const { openCreateForm, closeForm } = useSettingsSidebarActions();
	const { data: warehouses } = useGetWarehouseList();
	const { data: units } = useGetUnitList();
	const { mutateAsync: createWarehouse, isPending: isCreatingWarehouse } = useCreateWarehouse();
	const { mutateAsync: createUnit, isPending: isCreatingUnit } = useCreateUnit();

	const getData = (): SettingsRow[] => {
		if (activeItem === "Warehouse") {
			return (warehouses || []).map((w) => ({ ...w, type: "Warehouse" }));
		}
		if (activeItem === "Unit") {
			return units || [];
		}
		return settingsRows;
	};

	const isSaving = isCreatingWarehouse || isCreatingUnit;

	const data = getData();
	const filteredRows = data.filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));

	const columns = getColumnsForItem(activeItem);

	const handleSave = async (formData: Record<string, unknown>) => {
		try {
			if (activeItem === "Warehouse") {
				const warehouseData = {
					name: formData.name as string,
					descr: (formData.descr as string) || "",
					location: (formData.location as string) || "",
				};
				await createWarehouse(warehouseData);
			} else if (activeItem === "Unit") {
				const unitData = {
					name: formData.name as string,
					descr: (formData.descr as string) || "",
					type: formData.type as UnitType,
				};
				await createUnit(unitData);
			} else {
				if (formMode === "create") {
					toast.success(`${activeItem} has been created`);
				} else {
					toast.success(`${activeItem} has been updated`);
				}
			}
			closeForm();
		} catch {
			// Error handled in mutation
		}
	};

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Text variant="body2" className="font-semibold text-base text-sky-600">
					{activeItem}
				</Text>
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1" onClick={openCreateForm} disabled={isSaving}>
						New
					</Button>
					<Input
						placeholder="Search..."
						className="h-8 w-[200px]"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={filteredRows}
				columns={columns}
				paginationConfig={{
					page: page,
					totalItems: filteredRows.length,
					pageSize: 20,
					totalPages: Math.ceil(filteredRows.length / 20) || 1,
					paginationItems: [1],
					onPageChange: setPage,
					onPageSizeChange: () => {},
				}}
			/>

			<Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-sky-600">
							{formMode === "create" ? `Add ${activeItem}` : `Edit ${activeItem}`}
						</DialogTitle>
					</DialogHeader>
					<SettingsForm
						activeItem={activeItem}
						onSubmit={handleSave}
						onCancel={closeForm}
						mode={formMode}
						defaultValues={editItem || undefined}
						showTitle={false}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
