import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FilterField } from "./filter-field";

const CUSTOMERS = ["Customer 1", "Customer 2", "Customer 3"];

interface CustomerFilterProps {
	value: string;
	onChange: (value: string) => void;
}

export function CustomerFilter({ value, onChange }: CustomerFilterProps) {
	return (
		<FilterField label="Customer" required>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger>
					<SelectValue placeholder="Select" />
				</SelectTrigger>
				<SelectContent>
					{CUSTOMERS.map((customer) => (
						<SelectItem key={customer} value={customer}>
							{customer}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterField>
	);
}
