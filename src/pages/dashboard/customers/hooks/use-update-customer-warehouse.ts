import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";

export type UpdateWarehouseInput = {
	warehouse: string;
};

export const useUpdateCustomerWarehouse = (customerId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: UpdateWarehouseInput) => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.updateCustomer(customerId, payload);
		},
		onSuccess: () => {
			toast.success("Warehouse updated successfully");
			queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			queryClient.invalidateQueries({ queryKey: ["customers-list"] });
			queryClient.invalidateQueries({ queryKey: ["warehouse-list"] });
		},
		onError: () => {
			toast.error("Failed to update warehouse");
		},
	});
};
