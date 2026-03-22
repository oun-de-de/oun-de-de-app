import { DefaultForm, type DefaultFormData, SmartDataTable } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Text } from "@/core/ui/typography";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { useSettingsContentActions } from "../hooks/use-settings-content-actions";
import { useSettingsModule } from "../hooks/use-settings-module";
import { useFormState, useSettingsUiActions } from "../stores";
import { SettingsForm } from "./settings-form/settings-form";

type SettingsContentProps = {
	activeItem: string;
};

export function SettingsContent({ activeItem }: SettingsContentProps) {
	const { showForm, editItem, formMode } = useFormState();
	const { openCreateForm, closeForm } = useSettingsUiActions();
	const {
		accountingFormFields,
		accountingPlaceholderItem,
		canCreate,
		canEdit,
		columns,
		filteredRows,
		formKind,
		page,
		pageSize,
		search,
		setPage,
		setPageSize,
		setSearch,
		totalPages,
	} = useSettingsModule({
		activeItem,
		showForm,
	});
	const { handleSave, isSaving } = useSettingsContentActions({
		activeItem,
		formMode,
		editItem,
		onAfterSave: closeForm,
	});
	const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

	return (
		<div className="flex h-full min-h-0 flex-col gap-3">
			<div className="px-1 py-2">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-1">
						<Text variant="body2" className="font-semibold text-base text-sky-600">
							{activeItem}
						</Text>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<Button
							size="sm"
							className="gap-1.5 sm:self-auto"
							onClick={openCreateForm}
							disabled={isSaving || activeItem === "" || accountingPlaceholderItem || !canCreate}
						>
							<span className="text-base leading-none">+</span>
							New
						</Button>
						<Input
							placeholder="Search settings…"
							className="h-8 w-full sm:w-[220px]"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							disabled={!activeItem}
						/>
					</div>
				</div>
			</div>

			{activeItem ? (
				<div className="flex min-h-0 flex-1 overflow-hidden">
					<SmartDataTable
						className="flex-1 min-h-0"
						maxBodyHeight="100%"
						data={pagedRows}
						columns={columns}
						paginationConfig={{
							page,
							totalItems: filteredRows.length,
							pageSize,
							totalPages,
							paginationItems: buildPagination(page, totalPages),
							onPageChange: setPage,
							onPageSizeChange: setPageSize,
						}}
					/>
				</div>
			) : (
				<div className="flex h-full items-center justify-center bg-slate-50 px-6 text-center">
					<div className="space-y-2">
						<Text variant="body2" className="font-semibold text-slate-700">
							No settings are available for this section yet.
						</Text>
						<p className="text-sm text-slate-500">Switch to another settings group or connect this module next.</p>
					</div>
				</div>
			)}

			<Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl lg:max-w-4xl">
					<DialogHeader>
						<DialogTitle className="text-sky-600">
							{formMode === "create" ? `Add ${activeItem}` : `Edit ${activeItem}`}
						</DialogTitle>
					</DialogHeader>
					{formMode === "edit" && !canEdit ? null : formKind === "accounting" ? (
						<DefaultForm
							title={formMode === "create" ? `Add ${activeItem}` : `Edit ${activeItem}`}
							fields={accountingFormFields}
							onSubmit={(data) => handleSave(data as DefaultFormData)}
							onCancel={closeForm}
							defaultValues={(editItem as DefaultFormData | undefined) ?? undefined}
							submitLabel={formMode === "create" ? "Create" : "Save"}
							variant="compact"
							inputVariant="default"
							inputSize="lg"
							columns={2}
							className="gap-4 space-y-4"
							showTitle={false}
						/>
					) : accountingPlaceholderItem ? null : (
						<SettingsForm
							activeItem={activeItem}
							onSubmit={handleSave}
							onCancel={closeForm}
							mode={formMode}
							defaultValues={editItem || undefined}
							showTitle={false}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
