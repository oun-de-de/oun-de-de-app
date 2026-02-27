import { cva, type VariantProps } from "class-variance-authority";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Icon from "@/core/components/icon/icon";
import { useDebounce } from "@/core/hooks/use-debounce";
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
	optionsByField?: Record<string, SelectOption[]>;
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
	optionsByField,
}: FilterBarProps) {
	const [localSearch, setLocalSearch] = useState(searchValue || "");
	const debouncedSearch = useDebounce(localSearch, 300);
	const isUpdatingFromProp = useRef(false);

	const clearSearch = useCallback(() => {
		if (localSearch === "" && (searchValue || "") === "") {
			return;
		}
		isUpdatingFromProp.current = true;
		setLocalSearch("");
		if ((searchValue || "") !== "") {
			onSearchChange?.("");
		}
	}, [localSearch, onSearchChange, searchValue]);

	const handleOnTypeChange = useCallback(
		(value: string) => {
			if (value === typeValue) return;
			onTypeChange?.(value);
			if (value === "all") {
				clearSearch();
			}
		},
		[clearSearch, onTypeChange, typeValue],
	);

	const handleOnFieldChange = useCallback(
		(value: string) => {
			if (value === fieldValue) return;
			onFieldChange?.(value);
			clearSearch();
		},
		[clearSearch, fieldValue, onFieldChange],
	);

	// sync local state with prop when prop changes
	useEffect(() => {
		isUpdatingFromProp.current = true;
		setLocalSearch(searchValue || "");
	}, [searchValue]);

	// trigger callback only when debounced value changes from user input
	useEffect(() => {
		if (isUpdatingFromProp.current) {
			isUpdatingFromProp.current = false;
			return;
		}

		if (debouncedSearch !== (searchValue || "")) {
			onSearchChange?.(debouncedSearch);
		}
	}, [debouncedSearch, onSearchChange, searchValue]);

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

			<Select value={typeValue ?? ""} onValueChange={handleOnTypeChange}>
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

			<Select value={fieldValue ?? ""} onValueChange={handleOnFieldChange}>
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
				{fieldValue && optionsByField?.[fieldValue] ? (
					<Select value={localSearch} onValueChange={(value) => setLocalSearch(value)}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder={searchPlaceholder} />
						</SelectTrigger>
						<SelectContent>
							{optionsByField[fieldValue].map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : (
					<>
						<Input
							placeholder={searchPlaceholder}
							className="pl-9"
							value={localSearch}
							onChange={(event) => setLocalSearch(event.target.value)}
						/>
						<SearchIconWrapper>
							<Icon icon="mdi:magnify" />
						</SearchIconWrapper>
					</>
				)}
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
