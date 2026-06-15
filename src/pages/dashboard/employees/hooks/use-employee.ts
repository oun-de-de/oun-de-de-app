import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import employeeService from "@/core/api/services/employee-service";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import type { CreateEmployee, UpdateEmployeeProfile } from "@/core/types/employee";

export const useEmployeeOperations = () => {
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeProfile }) => employeeService.updateEmployee(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
			toast.success("Employee updated successfully");
		},
		onError: () => {
			toast.error("Failed to update employee");
		},
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateEmployee) => employeeService.createEmployee(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.all });
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
