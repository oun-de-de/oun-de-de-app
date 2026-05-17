import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import { CUSTOMER_QUERY_KEYS } from "@/core/query-keys/customer-query-keys";
import type { CreateProductSettings } from "@/core/types/customer";

export const useCreateProductSetting = (customerId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (setting: CreateProductSettings) => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.createProductSetting(customerId, setting);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: CUSTOMER_QUERY_KEYS.productSettings(customerId),
			});
		},
		onError: () => {
			toast.error("Failed to save product settings");
		},
	});
};

export const useGetProductSettings = (customerId?: string) => {
	return useQuery({
		queryKey: CUSTOMER_QUERY_KEYS.productSettings(customerId),
		queryFn: () => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.getProductSettings(customerId);
		},
		enabled: !!customerId,
	});
};
