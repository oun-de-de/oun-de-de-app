import { useQuery } from "@tanstack/react-query";
import employeeService from "@/core/api/services/employee-service";

export const useGetEmployees = () => {
	return useQuery({
		queryKey: ["employees"],
		queryFn: () => employeeService.getEmployeeList(),
	});
};
