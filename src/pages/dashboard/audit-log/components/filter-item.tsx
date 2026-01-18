import type { EntitySelectType } from "@/core/types/common";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

export type FilterItemProps = {
	options: EntitySelectType[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
};

function FilterItem({ options, value, onChange, placeholder }: FilterItemProps) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((opt) => (
					<SelectItem key={opt.key} value={opt.value}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export default FilterItem;
