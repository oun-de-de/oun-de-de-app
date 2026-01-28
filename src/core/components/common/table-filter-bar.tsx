import { cva, type VariantProps } from "class-variance-authority";
import styled from "styled-components";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { cn } from "@/core/utils";

const filterBarVariants = cva("flex flex-wrap items-center", {
	variants: {
		variant: {
			default: "gap-2",
			compact: "gap-1",
			transparent: "gap-2 bg-transparent",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type SelectOption = {
	value: string;
	label: string;
};

interface FilterBarProps extends VariantProps<typeof filterBarVariants> {
	typeOptions: SelectOption[];
	fieldOptions: SelectOption[];
	typeValue?: string;
	fieldValue?: string;
	searchValue?: string;
	typePlaceholder?: string;
	fieldPlaceholder?: string;
	searchPlaceholder?: string;
	className?: string;
	onTypeChange?: (value: string) => void;
	onFieldChange?: (value: string) => void;
	onSearchChange?: (value: string) => void;
	onFilterClick?: () => void;
}

export function TableFilterBar({
	typeOptions,
	fieldOptions,
	typeValue,
	fieldValue,
	searchValue,
	typePlaceholder = "Type",
	fieldPlaceholder = "Field",
	searchPlaceholder = "Search...",
	className,
	variant,
	onTypeChange,
	onFieldChange,
	onSearchChange,
	onFilterClick,
}: FilterBarProps) {
	return (
		<FilterContainer className={cn(filterBarVariants({ variant }), className)}>
			<Button
				variant="outline"
				size="icon"
				className="h-9 w-9"
				onClick={onFilterClick}
				disabled={!onFilterClick}
				aria-label="Filter"
			>
				<Icon icon="mdi:filter-variant" />
			</Button>

			<Select value={typeValue ?? ""} onValueChange={onTypeChange}>
				<SelectTrigger className="w-[160px]">
					<SelectValue placeholder={typePlaceholder} />
				</SelectTrigger>
				<SelectContent>
					{typeOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<Select value={fieldValue ?? ""} onValueChange={onFieldChange}>
				<SelectTrigger className="w-[160px]">
					<SelectValue placeholder={fieldPlaceholder} />
				</SelectTrigger>
				<SelectContent>
					{fieldOptions.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			<SearchWrapper>
				<Input
					placeholder={searchPlaceholder}
					className="pl-9"
					value={searchValue ?? ""}
					onChange={(event) => onSearchChange?.(event.target.value)}
				/>
				<SearchIconWrapper>
					<Icon icon="mdi:magnify" />
				</SearchIconWrapper>
			</SearchWrapper>
		</FilterContainer>
	);
}

//#region Styled components
const FilterContainer = styled.div``;

const SearchWrapper = styled.div.attrs({
	className: "relative flex-1 min-w-[180px]",
})``;

const SearchIconWrapper = styled.span.attrs({
	className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500",
})``;
//#endregion Styled components
