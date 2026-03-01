import type { UpdateCustomer } from "@/core/types/customer";
import { useUpdateCustomer } from "./use-update-customer";

export type UpdateWarehouseInput = {
	warehouseId: string | null;
};

export const useUpdateCustomerWarehouse = (customerId?: string) => {
	const { mutateAsync: updateCustomer, isPending } = useUpdateCustomer(customerId, {
		successMessage: "Warehouse updated successfully",
		errorMessage: "Failed to update warehouse",
		invalidateWarehouseList: true,
	});

	const mutateAsync = async (input: UpdateWarehouseInput) => {
		if (!customerId) throw new Error("Customer ID is required");

		const payload: UpdateCustomer = {
			warehouseId: input.warehouseId,
		};

		return updateCustomer(payload);
	};

	return {
		mutateAsync,
		isPending,
	};
};
