import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Warehouse } from "@/core/types/setting";
import { useCreateWarehouse, useGetWarehouseList } from "@/pages/dashboard/settings/hooks/use-settings";
import { useUpdateCustomerWarehouse } from "../../hooks/use-update-customer-warehouse";

export type CustomerWarehouse = {
	warehouseId: string;
	warehouseName: string;
};

export const useWarehouseSettingsForm = (customerId?: string, currentWarehouseId?: string) => {
	const { data: warehouses, isLoading } = useGetWarehouseList();
	const { mutateAsync: updateCustomerWarehouse, isPending: isSaving } = useUpdateCustomerWarehouse(customerId);
	const { mutateAsync: createWarehouse, isPending: isCreatingWarehouse } = useCreateWarehouse();

	const [selectedWarehouse, setSelectedWarehouse] = useState<CustomerWarehouse | null>(null);

	useEffect(() => {
		setSelectedWarehouse(null);
	}, [customerId, currentWarehouseId]);

	useEffect(() => {
		if (!selectedWarehouse && currentWarehouseId && warehouses) {
			const warehouse = warehouses.find((w) => w.id === currentWarehouseId);
			if (warehouse) {
				setSelectedWarehouse({
					warehouseId: warehouse.id,
					warehouseName: warehouse.name,
				});
			}
		}
	}, [currentWarehouseId, warehouses, selectedWarehouse]);

	const availableWarehouses = useMemo(() => {
		if (!warehouses) return [];
		return selectedWarehouse ? warehouses.filter((w) => w.id !== selectedWarehouse.warehouseId) : warehouses;
	}, [warehouses, selectedWarehouse]);

	const handleAdd = (warehouse: Warehouse) => {
		setSelectedWarehouse({
			warehouseId: warehouse.id,
			warehouseName: warehouse.name,
		});
	};

	const handleRemove = (warehouseId: string) => {
		if (selectedWarehouse?.warehouseId === warehouseId) {
			setSelectedWarehouse(null);
		}
	};

	const handleSave = async () => {
		if (!customerId) return;

		if (selectedWarehouse) {
			try {
				await updateCustomerWarehouse({
					warehouseId: selectedWarehouse.warehouseId,
				});
			} catch {
				// error toast handled in hook
			}
		} else {
			toast.error("Please select a warehouse");
		}
	};

	return {
		selectedWarehouse,
		availableWarehouses,
		isLoading,
		isCreatingWarehouse,
		isSaving,
		createWarehouse,
		handleAdd,
		handleRemove,
		handleSave,
	};
};
