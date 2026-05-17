import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import { SETTINGS_QUERY_KEYS } from "@/core/query-keys/settings-query-keys";
import type { UpdateCustomer } from "@/core/types/customer";
import { invalidateCustomerInfoQueries } from "./customer-query-utils";

type UseUpdateCustomerOptions = {
	successMessage?: string;
	errorMessage?: string;
	showSuccessToast?: boolean;
	invalidateWarehouseList?: boolean;
};

export const useUpdateCustomer = (customerId?: string, options?: UseUpdateCustomerOptions) => {
	const queryClient = useQueryClient();
	const {
		successMessage,
		errorMessage = "Failed to update customer",
		showSuccessToast = true,
		invalidateWarehouseList = false,
	} = options || {};

	return useMutation({
		mutationFn: async (payload: Partial<UpdateCustomer>) => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.updateCustomer(customerId, payload);
		},
		onSuccess: () => {
			if (showSuccessToast && successMessage) {
				toast.success(successMessage);
			}
			invalidateCustomerInfoQueries(queryClient, customerId);
			if (invalidateWarehouseList) {
				queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.warehouses.all() });
			}
		},
		onError: () => {
			toast.error(errorMessage);
		},
	});
};
