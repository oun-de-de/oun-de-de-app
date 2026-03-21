import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import settingService from "@/core/api/services/setting-service";
import type { CreateCurrency, CreateUnit, CreateWarehouse } from "@/core/types/setting";

type SettingsQueryOptions = {
	enabled?: boolean;
};

const SETTINGS_STALE_TIME = 5 * 60 * 1000;

export const useGetWarehouseList = (options?: SettingsQueryOptions) => {
	return useQuery({
		queryKey: ["warehouse-list"],
		queryFn: settingService.getWarehouseList,
		enabled: options?.enabled ?? true,
		staleTime: SETTINGS_STALE_TIME,
	});
};

export const useCreateWarehouse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateWarehouse) => settingService.createWarehouse(data),
		onSuccess: () => {
			toast.success("Warehouse created successfully");
			queryClient.invalidateQueries({ queryKey: ["warehouse-list"] });
		},
		onError: () => {
			toast.error("Failed to create warehouse");
		},
	});
};

export const useUpdateWarehouse = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: CreateWarehouse }) => settingService.updateWarehouse(id, data),
		onSuccess: () => {
			toast.success("Warehouse updated successfully");
			queryClient.invalidateQueries({ queryKey: ["warehouse-list"] });
		},
		onError: () => {
			toast.error("Failed to update warehouse");
		},
	});
};

export const useGetUnitList = (options?: SettingsQueryOptions) => {
	return useQuery({
		queryKey: ["unit-list"],
		queryFn: settingService.getUnitList,
		enabled: options?.enabled ?? true,
		staleTime: SETTINGS_STALE_TIME,
	});
};

export const useCreateUnit = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateUnit) => settingService.createUnit(data),
		onSuccess: () => {
			toast.success("Unit created successfully");
			queryClient.invalidateQueries({ queryKey: ["unit-list"] });
		},
		onError: () => {
			toast.error("Failed to create unit");
		},
	});
};

export const useUpdateUnit = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: CreateUnit }) => settingService.updateUnit(id, data),
		onSuccess: () => {
			toast.success("Unit updated successfully");
			queryClient.invalidateQueries({ queryKey: ["unit-list"] });
		},
		onError: () => {
			toast.error("Failed to update unit");
		},
	});
};

export const useGetCurrencyList = (options?: SettingsQueryOptions) => {
	return useQuery({
		queryKey: ["currency-list"],
		queryFn: settingService.getCurrencyList,
		enabled: options?.enabled ?? true,
		staleTime: SETTINGS_STALE_TIME,
	});
};

export const useCreateCurrency = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateCurrency) => settingService.createCurrency(data),
		onSuccess: () => {
			toast.success("Currency created successfully");
			queryClient.invalidateQueries({ queryKey: ["currency-list"] });
		},
		onError: () => {
			toast.error("Failed to create currency");
		},
	});
};
