import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { FilterField } from "./filter-field";

const CATEGORIES = ["General", "Category 1", "Category 2"];

interface SaleCategoryFilterProps {
	value: string;
	onChange: (value: string) => void;
}

export function SaleCategoryFilter({ value, onChange }: SaleCategoryFilterProps) {
	return (
		<FilterField label="Sale Category" required>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger>
					<SelectValue placeholder="Select" />
				</SelectTrigger>
				<SelectContent>
					{CATEGORIES.map((category) => (
						<SelectItem key={category} value={category}>
							{category}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</FilterField>
	);
}
