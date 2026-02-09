import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
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
				queryKey: ["customer-product-settings", customerId],
			});
		},
		onError: () => {
			toast.error("Failed to create product setting");
		},
	});
};

export const useGetProductSettings = (customerId?: string) => {
	return useQuery({
		queryKey: ["customer-product-settings", customerId],
		queryFn: () => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.getProductSettings(customerId);
		},
		enabled: !!customerId,
	});
};

export const useUpdateProductSetting = (customerId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ productId, setting }: { productId: string; setting: CreateProductSettings }) => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.updateProductSetting(customerId, productId, setting);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["customer-product-settings", customerId],
			});
		},
		onError: () => {
			toast.error("Failed to update product setting");
		},
	});
};

export const useDeleteProductSetting = (customerId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (productId: string) => {
			if (!customerId) throw new Error("Customer ID is required");
			return customerService.deleteProductSetting(customerId, productId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["customer-product-settings", customerId],
			});
		},
		onError: () => {
			toast.error("Failed to delete product setting");
		},
	});
};
