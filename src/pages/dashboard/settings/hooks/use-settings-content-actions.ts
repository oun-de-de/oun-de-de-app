import { toast } from "sonner";
import type { DefaultFormData } from "@/core/components/common";
import type { AccountTypeNature } from "@/core/types/accounting";
import type { SettingsRow } from "@/core/types/common";
import type { UnitType } from "@/core/types/setting";
import { useCreateAccountingSetting } from "./use-accounting-settings";
import {
	useCreateCurrency,
	useCreateUnit,
	useCreateWarehouse,
	useUpdateUnit,
	useUpdateWarehouse,
} from "./use-settings";

type UseSettingsContentActionsParams = {
	activeItem: string;
	formMode: "create" | "edit";
	editItem: SettingsRow | null;
	onAfterSave: () => void;
};

export function useSettingsContentActions({
	activeItem,
	formMode,
	editItem,
	onAfterSave,
}: UseSettingsContentActionsParams) {
	const { mutateAsync: createWarehouse, isPending: isCreatingWarehouse } = useCreateWarehouse();
	const { mutateAsync: updateWarehouse, isPending: isUpdatingWarehouse } = useUpdateWarehouse();
	const { mutateAsync: createUnit, isPending: isCreatingUnit } = useCreateUnit();
	const { mutateAsync: updateUnit, isPending: isUpdatingUnit } = useUpdateUnit();
	const { mutateAsync: createCurrency, isPending: isCreatingCurrency } = useCreateCurrency();
	const {
		createAccountType,
		createChartOfAccount,
		createJournalClass,
		createJournalType,
		isPending: isSavingAccounting,
	} = useCreateAccountingSetting();

	const handleSave = async (formData: DefaultFormData) => {
		try {
			let successMessage: string | null = null;

			if (activeItem === "Warehouse") {
				const warehouseData = {
					name: String(formData.name ?? ""),
					descr: String(formData.descr ?? ""),
					location: String(formData.location ?? ""),
				};

				if (formMode === "edit" && editItem?.id) {
					await updateWarehouse({ id: editItem.id, data: warehouseData });
				} else {
					await createWarehouse(warehouseData);
				}
				successMessage = formMode === "edit" ? `${activeItem} has been updated` : `${activeItem} has been created`;
			} else if (activeItem === "Unit") {
				const unitData = {
					name: String(formData.name ?? ""),
					descr: String(formData.descr ?? ""),
					type: formData.type as UnitType,
				};

				if (formMode === "edit" && editItem?.id) {
					await updateUnit({ id: editItem.id, data: unitData });
				} else {
					await createUnit(unitData);
				}
				successMessage = formMode === "edit" ? `${activeItem} has been updated` : `${activeItem} has been created`;
			} else if (activeItem === "Currency") {
				await createCurrency({
					name: String(formData.name ?? "").trim(),
					descr: String(formData.descr ?? "").trim() || undefined,
				});
				successMessage = `${activeItem} has been created`;
			} else if (activeItem === "Chart of Accounts") {
				await createChartOfAccount.mutateAsync({
					code: String(formData.code ?? "").trim(),
					name: String(formData.name ?? "").trim(),
					accountTypeId: String(formData.accountTypeId ?? ""),
					descr: String(formData.descr ?? "").trim() || undefined,
				});
				successMessage = `${activeItem} has been created`;
			} else if (activeItem === "Account Type") {
				await createAccountType.mutateAsync({
					code: String(formData.code ?? "").trim(),
					name: String(formData.name ?? "").trim(),
					nature: formData.nature as AccountTypeNature,
					descr: String(formData.descr ?? "").trim() || undefined,
				});
				successMessage = `${activeItem} has been created`;
			} else if (activeItem === "Journal Type") {
				await createJournalType.mutateAsync({
					name: String(formData.name ?? "").trim(),
					descr: String(formData.descr ?? "").trim() || undefined,
				});
				successMessage = `${activeItem} has been created`;
			} else if (activeItem === "Journal Class") {
				await createJournalClass.mutateAsync({
					name: String(formData.name ?? "").trim(),
					descr: String(formData.descr ?? "").trim() || undefined,
				});
				successMessage = `${activeItem} has been created`;
			} else if (formMode === "create") {
				successMessage = `${activeItem} has been created`;
			} else {
				successMessage = `${activeItem} has been updated`;
			}

			if (successMessage) {
				toast.success(successMessage);
			}

			onAfterSave();
		} catch {
			// Error handled in mutation or network layer
		}
	};

	return {
		handleSave,
		isSaving:
			isCreatingWarehouse ||
			isUpdatingWarehouse ||
			isCreatingUnit ||
			isUpdatingUnit ||
			isCreatingCurrency ||
			isSavingAccounting,
	};
}
