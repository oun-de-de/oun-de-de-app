import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import type { UpdateCustomerInfoInput } from "../utils/map-customer-form-to-update-payload";

type UseUpdateCustomerInfoOptions = {
	showSuccessToast?: boolean;
};

export const useUpdateCustomerInfo = (customerId?: string, options?: UseUpdateCustomerInfoOptions) => {
	const queryClient = useQueryClient();
	const { showSuccessToast = true } = options || {};

	return useMutation({
		mutationFn: async (payload: UpdateCustomerInfoInput) => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.updateCustomer(customerId, payload);
		},
		onSuccess: () => {
			if (showSuccessToast) {
				toast.success("Customer info updated successfully");
			}
			queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			queryClient.invalidateQueries({ queryKey: ["customers-list"] });
		},
		onError: () => {
			toast.error("Failed to update customer info");
		},
	});
};
