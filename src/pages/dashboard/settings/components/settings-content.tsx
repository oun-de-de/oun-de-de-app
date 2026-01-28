import { useState } from "react";
import { toast } from "sonner";
import { settingsRows } from "@/_mock/data/dashboard";
import { SmartDataTable } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";

import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Text } from "@/core/ui/typography";

import { useFormState, useSettingsSidebarActions } from "../stores";
import { columns } from "./settings-columns";
import { SettingsForm } from "./settings-form/settings-form";

type SettingsContentProps = {
	activeItem: string;
};

export function SettingsContent({ activeItem }: SettingsContentProps) {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");

	// Use store for form state
	const { showForm, editItem, formMode } = useFormState();
	const { openCreateForm, closeForm } = useSettingsSidebarActions();

	// Filter based on active item (mock logic)
	const filteredRows = settingsRows.filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));

	const handleSave = async (_data: Record<string, unknown>) => {
		// Simulate API call
		if (formMode === "create") {
			toast.success(`${activeItem} has been created`);
		} else {
			toast.success(`${activeItem} has been updated`);
		}
		closeForm();
	};

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Text variant="body2" className="font-semibold text-base text-sky-600">
					{activeItem}
				</Text>
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1" onClick={openCreateForm}>
						<Icon icon="mdi:plus" />
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
						defaultValues={editItem ? { name: editItem.name, type: editItem.type } : undefined}
						showTitle={false}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
