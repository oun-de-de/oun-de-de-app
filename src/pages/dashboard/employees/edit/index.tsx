import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import employeeService from "@/core/api/services/employee-service";
import { BackButton } from "@/core/components/common";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import { Text } from "@/core/ui/typography";
import { EmployeeForm, type EmployeeFormData } from "../components/employee-form";
import { useEmployeeOperations } from "../hooks/use-employee";

const EMPLOYEES_PATH = "/dashboard/employees";

export default function EmployeeEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const { data: employees, isLoading } = useQuery({
		queryKey: EMPLOYEE_QUERY_KEYS.list(),
		queryFn: () => employeeService.getEmployeeList(),
	});
	const { updateEmployee } = useEmployeeOperations();

	const employee = useMemo(() => employees?.find((e: any) => e.id === id), [employees, id]);

	const handleSubmit = async (formData: EmployeeFormData) => {
		if (!id) return;
		try {
			await updateEmployee({
				id,
				data: {
					firstName: formData.firstName,
					lastName: formData.lastName,
				},
			});
			navigate(EMPLOYEES_PATH);
		} catch (error) {
			console.error("Failed to update employee", error);
		}
	};

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (!employee) {
		return <div className="p-6">Employee not found</div>;
	}

	return (
		<div className="flex flex-col h-full p-6 gap-6 overflow-auto flex-1">
			<div className="flex items-center gap-3">
				<BackButton appearance="icon" onClick={() => navigate(EMPLOYEES_PATH)} />
				<Text className="font-semibold text-sky-600">Edit Employee</Text>
			</div>

			<EmployeeForm
				onSubmit={handleSubmit}
				onCancel={() => navigate(EMPLOYEES_PATH)}
				mode="edit"
				showTitle={false}
				defaultValues={employee as any}
			/>
		</div>
	);
}
