import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CustomerDetail, UpdateCustomer } from "@/core/types/customer";
import { mapCustomerFormToUpdatePayload } from "../utils/map-customer-form-to-update-payload";
import { useUpdateCustomer } from "./use-update-customer";

export type UpdateWarehouseInput = {
	warehouseId: string | null;
};

export const useUpdateCustomerWarehouse = (customerId?: string) => {
	const queryClient = useQueryClient();
	const { mutateAsync: updateCustomer, isPending } = useUpdateCustomer(customerId, {
		successMessage: "Warehouse updated successfully",
		errorMessage: "Failed to update warehouse",
		invalidateWarehouseList: true,
	});

	const mutateAsync = async (input: UpdateWarehouseInput) => {
		if (!customerId) throw new Error("Customer ID is required");

		// Get the current customer data to prevent partial update wiping out existing data
		const currentCustomer = queryClient.getQueryData<CustomerDetail>(["customer", customerId]);

		if (!currentCustomer) {
			toast.error("Customer data not found. Please refresh the page.");
			throw new Error("Customer data not found");
		}

		// Map to a valid update payload mimicking the form submission
		const payload: UpdateCustomer = {
			...mapCustomerFormToUpdatePayload(currentCustomer),
			warehouseId: input.warehouseId,
		};

		return updateCustomer(payload);
	};

	return {
		mutateAsync,
		isPending,
	};
};
