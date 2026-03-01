import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import settingService from "@/core/api/services/setting-service";
import type { CreateUnit, CreateWarehouse } from "@/core/types/setting";

export const useGetWarehouseList = () => {
	return useQuery({
		queryKey: ["warehouse-list"],
		queryFn: settingService.getWarehouseList,
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

export const useGetUnitList = () => {
	return useQuery({
		queryKey: ["unit-list"],
		queryFn: settingService.getUnitList,
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
