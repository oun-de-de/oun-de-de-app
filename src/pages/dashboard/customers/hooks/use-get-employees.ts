import { useQuery } from "@tanstack/react-query";
import employeeService from "@/core/api/services/employee-service";

type UseGetEmployeesParams = {
	page?: number;
	size?: number;
};

export const useGetEmployees = ({ page = 0, size = 100 }: UseGetEmployeesParams = {}) => {
	return useQuery({
		queryKey: ["employees", { page, size }],
		queryFn: () => employeeService.getEmployeeList({ page, size }),
	});
};
