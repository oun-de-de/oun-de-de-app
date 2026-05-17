import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import settingService from "@/core/api/services/setting-service";
import { SETTINGS_QUERY_KEYS } from "@/core/query-keys/settings-query-keys";
import type { CreateCurrency, CreateSupplier, CreateUnit, CreateWarehouse } from "@/core/types/setting";

type SettingsQueryOptions = {
	enabled?: boolean;
};

const SETTINGS_STALE_TIME = 5 * 60 * 1000;

export const useGetWarehouseList = (options?: SettingsQueryOptions) => {
	return useQuery({
		queryKey: SETTINGS_QUERY_KEYS.warehouses.list(),
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
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.warehouses.all() });
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
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.warehouses.all() });
		},
		onError: () => {
			toast.error("Failed to update warehouse");
		},
	});
};

export const useGetUnitList = (options?: SettingsQueryOptions) => {
	return useQuery({
		queryKey: SETTINGS_QUERY_KEYS.units.list(),
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
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.units.all() });
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
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.units.all() });
		},
		onError: () => {
			toast.error("Failed to update unit");
		},
	});
};

export const useGetCurrencyList = (options?: SettingsQueryOptions) => {
	return useQuery({
		queryKey: SETTINGS_QUERY_KEYS.currencies.list(),
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
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.currencies.all() });
		},
		onError: () => {
			toast.error("Failed to create currency");
		},
	});
};

export const useGetSupplierList = (options?: SettingsQueryOptions) => {
	return useQuery({
		queryKey: SETTINGS_QUERY_KEYS.suppliers.list(),
		queryFn: settingService.getSupplierList,
		enabled: options?.enabled ?? true,
		staleTime: SETTINGS_STALE_TIME,
	});
};

export const useCreateSupplier = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateSupplier) => settingService.createSupplier(data),
		onSuccess: () => {
			toast.success("Supplier created successfully");
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.suppliers.all() });
		},
		onError: () => {
			toast.error("Failed to create supplier");
		},
	});
};

export const useUpdateSupplier = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: CreateSupplier }) => settingService.updateSupplier(id, data),
		onSuccess: () => {
			toast.success("Supplier updated successfully");
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEYS.suppliers.all() });
		},
		onError: () => {
			toast.error("Failed to update supplier");
		},
	});
};
