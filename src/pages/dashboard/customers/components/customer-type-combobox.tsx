import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "@/core/ui/combobox";
import { inputVariants } from "@/core/components/form/styles/variants";
import { cn } from "@/core/utils";

type CustomerTypeOption = {
	value: string;
	label: string;
};

const CUSTOMER_TYPE_ITEMS: CustomerTypeOption[] = [
	{ value: "all", label: "All" },
	{ value: "vip", label: "VIP" },
	{ value: "retail", label: "Retail" },
	{ value: "1", label: "Term 1 days" },
	{ value: "3", label: "Term 3 days" },
	{ value: "5", label: "Term 5 days" },
	{ value: "7", label: "Term 7 days" },
	{ value: "15", label: "Term 15 days" },
	{ value: "30", label: "Term 30 days" },
	{ value: "45", label: "Term 45 days" },
];

type CustomerTypeComboboxProps = {
	value: string;
	onChange: (value: string) => void;
};

const normalize = (value: string): string => value.trim().toLowerCase();

export function CustomerTypeCombobox({ value, onChange }: CustomerTypeComboboxProps) {
	const normalizedValue = normalize(value);
	const selectedOption = CUSTOMER_TYPE_ITEMS.find((item) => item.value === normalizedValue) ?? null;
	const displayValue = selectedOption ? selectedOption.label : value;
	const anchorRef = useComboboxAnchor();

	return (
		<Combobox<CustomerTypeOption>
			items={CUSTOMER_TYPE_ITEMS}
			value={selectedOption}
			inputValue={displayValue}
			onValueChange={(nextValue) => onChange(nextValue?.value ?? "")}
			onInputValueChange={(nextInputValue) => onChange(normalize(nextInputValue))}
		>
			<div ref={anchorRef} className="w-full">
				<ComboboxInput
					className={cn(
						inputVariants({ variant: "default", size: "sm", state: "normal" }),
						"w-full px-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:[box-shadow:var(--ids-sem-ring-focus)]",
					)}
					placeholder="Customer Type / Term"
					aria-label="Customer Type"
				/>
			</div>
			<ComboboxContent anchor={anchorRef}>
				<ComboboxEmpty>No matching option.</ComboboxEmpty>
				<ComboboxList>{(item) => <ComboboxItem value={item}>{item.label}</ComboboxItem>}</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
