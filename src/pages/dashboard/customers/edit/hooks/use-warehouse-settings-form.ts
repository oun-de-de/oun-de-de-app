import { useCallback, useMemo, useState } from "react";
import type { Warehouse } from "@/core/types/setting";
import { useGetWarehouseList } from "@/pages/dashboard/settings/hooks/use-settings";
import { useUpdateCustomerWarehouse } from "../../hooks/use-update-customer-warehouse";

export type CustomerWarehouse = {
	warehouseId: string;
	warehouseName: string;
};

export const useWarehouseSettingsForm = (customerId?: string, currentWarehouseId?: string) => {
	const { data: warehouses, isLoading } = useGetWarehouseList();
	const { mutateAsync: updateCustomerWarehouse, isPending: isSaving } = useUpdateCustomerWarehouse(customerId);
	const scopeKey = `${customerId ?? ""}:${currentWarehouseId ?? ""}`;
	const [draftSelection, setDraftSelection] = useState<{
		scopeKey: string;
		warehouseId: string | null | undefined;
	}>({
		scopeKey,
		warehouseId: undefined,
	});

	const draftWarehouseId = draftSelection.scopeKey === scopeKey ? draftSelection.warehouseId : undefined;
	const activeWarehouseId = draftWarehouseId === undefined ? currentWarehouseId : draftWarehouseId;
	const selectedWarehouse = useMemo(() => {
		if (!activeWarehouseId || !warehouses) return null;
		const warehouse = warehouses.find((item) => item.id === activeWarehouseId);
		if (!warehouse) return null;

		return {
			warehouseId: warehouse.id,
			warehouseName: warehouse.name,
		};
	}, [activeWarehouseId, warehouses]);

	const availableWarehouses = useMemo(() => {
		if (!warehouses) return [];
		return selectedWarehouse ? warehouses.filter((w) => w.id !== selectedWarehouse.warehouseId) : warehouses;
	}, [warehouses, selectedWarehouse]);

	const handleAdd = useCallback(
		(warehouse: Warehouse) => {
			setDraftSelection({ scopeKey, warehouseId: warehouse.id });
		},
		[scopeKey],
	);

	const handleRemove = useCallback(
		(warehouseId: string) => {
			if (selectedWarehouse?.warehouseId === warehouseId) {
				setDraftSelection({ scopeKey, warehouseId: null });
			}
		},
		[scopeKey, selectedWarehouse],
	);

	const handleSave = useCallback(async () => {
		if (!customerId) return;

		try {
			await updateCustomerWarehouse({
				warehouseId: selectedWarehouse?.warehouseId ?? null,
			});
		} catch {
			// error toast handled in hook
		}
	}, [customerId, selectedWarehouse, updateCustomerWarehouse]);

	return {
		selectedWarehouse,
		availableWarehouses,
		isLoading,
		isSaving,
		handleAdd,
		handleRemove,
		handleSave,
	};
};
