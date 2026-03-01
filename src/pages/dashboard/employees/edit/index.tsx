import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { EmployeeForm, type EmployeeFormData } from "../components/employee-form";
import { useEmployeeOperations, useGetEmployees } from "../hooks/use-employee";

export default function EmployeeEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();

	const { data: employees, isLoading } = useGetEmployees();
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
			navigate("/dashboard/employees");
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
			<EmployeeForm
				onSubmit={handleSubmit}
				onCancel={() => navigate("/dashboard/employees")}
				mode="edit"
				defaultValues={employee as any}
			/>
		</div>
	);
}
