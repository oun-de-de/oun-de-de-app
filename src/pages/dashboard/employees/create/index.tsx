import { useNavigate } from "react-router";
import { BackButton } from "@/core/components/common";
import { Text } from "@/core/ui/typography";
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
			<div className="flex items-center gap-3">
				<BackButton appearance="icon" onClick={() => navigate("/dashboard/employees")} />
				<Text className="font-semibold text-sky-600">Add Employee</Text>
			</div>

			<EmployeeForm
				onSubmit={handleSubmit}
				onCancel={() => navigate("/dashboard/employees")}
				mode="create"
				showTitle={false}
			/>
		</div>
	);
}
