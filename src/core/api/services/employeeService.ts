import type { CreateEmployee, Employee } from "@/core/types/employee";
import { apiClient } from "../apiClient";

export enum EmployeeApi {
	List = "/employees",
	Create = "/employees",
}

const getEmployeeList = (): Promise<Employee[]> =>
	apiClient.get<Employee[]>({
		url: EmployeeApi.List,
	});

const createEmployee = (employee: CreateEmployee) =>
	apiClient.post<Employee>({ url: EmployeeApi.Create, data: employee });

export default {
	getEmployeeList,
	createEmployee,
};
