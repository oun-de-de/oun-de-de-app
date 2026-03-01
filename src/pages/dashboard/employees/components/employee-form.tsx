import { DefaultForm, type DefaultFormData } from "@/core/components/common";
import { CREATE_EMPLOYEE_FIELDS, EMPLOYEE_FIELDS } from "../constants/employee-fields";

export type EmployeeFormData = DefaultFormData & {
	username: string;
	password?: string;
	reEnteredPassword?: string;
	firstName?: string;
	lastName?: string;
};

type EmployeeFormProps = {
	onSubmit?: (data: EmployeeFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: Partial<EmployeeFormData>;
	mode?: "create" | "edit";
	showTitle?: boolean;
};

export function EmployeeForm({
	onSubmit,
	onCancel,
	defaultValues,
	mode = "create",
	showTitle = true,
}: EmployeeFormProps) {
	const title = mode === "create" ? "Add Employee" : "Edit Employee";
	const fields = mode === "create" ? CREATE_EMPLOYEE_FIELDS : EMPLOYEE_FIELDS;

	return (
		<DefaultForm<EmployeeFormData>
			title={title}
			fields={fields}
			onSubmit={onSubmit}
			onCancel={onCancel}
			defaultValues={defaultValues as any}
			submitLabel={mode === "create" ? "Create" : "Save"}
			variant="default"
			inputVariant="default"
			inputSize="md"
			columns={mode === "create" ? 1 : 2}
			showTitle={showTitle}
		/>
	);
}
