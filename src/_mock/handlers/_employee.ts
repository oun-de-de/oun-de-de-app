import { HttpResponse, http } from "msw";
import type { CreateEmployee, Employee, UpdateEmployeeProfile } from "@/core/types/employee";

const STORAGE_KEY = "mock_employees";

const getEmployeesFromStorage = (): Employee[] => {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) {
		const initial: Employee[] = [
			{
				id: "emp-1",
				username: "jdoe",
				firstName: "John",
				lastName: "Doe",
			},
		];
		localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
		return initial;
	}
	return JSON.parse(stored);
};

const saveEmployeesToStorage = (employees: Employee[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

export const employeeList = http.get("/api/v1/employees", () => {
	const employees = getEmployeesFromStorage();
	return HttpResponse.json(employees);
});

export const createEmployee = http.post("/api/v1/employees", async ({ request }) => {
	const data = (await request.json()) as CreateEmployee;
	const employees = getEmployeesFromStorage();
	const newEmployee: Employee = {
		id: `emp-${Date.now()}`,
		username: data.username,
		firstName: "",
		lastName: "",
	};
	employees.push(newEmployee);
	saveEmployeesToStorage(employees);
	return HttpResponse.json(newEmployee);
});

export const updateEmployee = http.put("/api/v1/employees/:id", async ({ params, request }) => {
	const { id } = params;
	const data = (await request.json()) as UpdateEmployeeProfile;
	const employees = getEmployeesFromStorage();
	const index = employees.findIndex((e) => e.id === id);
	if (index === -1) {
		return new HttpResponse(null, { status: 404 });
	}

	const updatedEmployee = { ...employees[index], ...data };
	employees[index] = updatedEmployee;
	saveEmployeesToStorage(employees);
	return HttpResponse.json(updatedEmployee);
});
