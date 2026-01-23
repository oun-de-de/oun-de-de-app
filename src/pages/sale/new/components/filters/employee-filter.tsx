import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FilterField } from "./filter-field";

const EMPLOYEES = ["Employee 1", "Employee 2", "Employee 3"];

interface EmployeeFilterProps {
	value: string;
	onChange: (value: string) => void;
}

export function EmployeeFilter({ value, onChange }: EmployeeFilterProps) {
	return (
		<FilterField label="Employee" required>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger>
					<SelectValue placeholder="Select" />
				</SelectTrigger>
				<SelectContent>
					{EMPLOYEES.map((employee) => (
						<SelectItem key={employee} value={employee}>
							{employee}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterField>
	);
}
