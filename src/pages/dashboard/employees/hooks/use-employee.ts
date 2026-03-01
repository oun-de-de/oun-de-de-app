import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import employeeService from "@/core/api/services/employee-service";
import type { CreateEmployee, UpdateEmployeeProfile } from "@/core/types/employee";

export const useGetEmployees = (params?: { page?: number; size?: number }) => {
	return useQuery({
		queryKey: ["employees", params],
		queryFn: () => employeeService.getEmployeeList(params),
	});
};

export const useEmployeeOperations = () => {
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeProfile }) => employeeService.updateEmployee(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			toast.success("Employee updated successfully");
		},
		onError: () => {
			toast.error("Failed to update employee");
		},
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateEmployee) => employeeService.createEmployee(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees"] });
			toast.success("Employee created successfully");
		},
		onError: () => {
			toast.error("Failed to create employee");
		},
	});

	return {
		updateEmployee: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		createEmployee: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
	};
};
