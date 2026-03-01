import { useNavigate } from "react-router";
import { EmployeeForm, type EmployeeFormData } from "../components/employee-form";
import { useEmployeeOperations } from "../hooks/use-employee";

export default function EmployeeCreatePage() {
	const navigate = useNavigate();
	const { createEmployee } = useEmployeeOperations();

	const handleSubmit = async (data: EmployeeFormData) => {
		try {
			await createEmployee(data);
			navigate("/dashboard/employees");
		} catch (error) {
			console.error("Failed to create employee", error);
		}
	};

	return (
		<div className="flex flex-col h-full p-6 gap-6 overflow-auto flex-1">
			<EmployeeForm onSubmit={handleSubmit} onCancel={() => navigate("/dashboard/employees")} mode="create" />
		</div>
	);
}
