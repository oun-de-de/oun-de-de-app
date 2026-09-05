import { Check as CheckIcon, ChevronDown as ChevronDownIcon, X as XIcon } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/core/ui/label";
import { Popover, PopoverAnchor, PopoverContent } from "@/core/ui/popover";
import { cn } from "@/core/utils";

export function FilterRow({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
	return (
		<div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3">
			<Label className="text-slate-600">
				{required ? <span className="text-red-500">*</span> : null} {label}
			</Label>
			{children}
		</div>
	);
}

export type ReportComboboxOption = {
	value: string;
	label: string;
};

export type ReportSearchComboboxProps = {
	id: string;
	label: string;
	value?: string;
	options: ReportComboboxOption[];
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	clearable?: boolean;
	onChange: (value: string) => void;
};

export function ReportSearchCombobox({
	id,
	label,
	value = "all",
	options,
	placeholder,
	required,
	disabled = false,
	clearable = true,
	onChange,
}: ReportSearchComboboxProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const triggerRef = useRef<HTMLDivElement>(null);
	const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (isOpen && triggerRef.current) {
			setTriggerWidth(triggerRef.current.offsetWidth);
		}
	}, [isOpen]);

	const selectedOption = options.find((opt) => opt.value === value) ?? null;
	const displayLabel = selectedOption ? selectedOption.label : value === "all" ? "All" : value;

	const filteredOptions = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return options;
		return options.filter(
			(opt) => opt.label.toLowerCase().includes(trimmed) || opt.value.toLowerCase().includes(trimmed),
		);
	}, [options, query]);

	useEffect(() => {
		setHighlightedIndex(-1);
	}, [query, isOpen]);

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
		setQuery("");
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange("all");
		setQuery("");
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			if (!isOpen) {
				setIsOpen(true);
				setHighlightedIndex(0);
			} else {
				setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
			}
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (!isOpen) {
				setIsOpen(true);
				setHighlightedIndex(filteredOptions.length - 1);
			} else {
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
			}
		} else if (e.key === "Enter") {
			if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
				e.preventDefault();
				handleSelect(filteredOptions[highlightedIndex].value);
			}
		} else if (e.key === "Escape") {
			if (isOpen) {
				e.preventDefault();
				setIsOpen(false);
				setQuery("");
			}
		}
	};

	return (
		<FilterRow label={label} required={required}>
			<Popover
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) setQuery("");
				}}
			>
				<PopoverAnchor asChild>
					<div
						ref={triggerRef}
						className={cn(
							"flex h-8 w-full cursor-pointer items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-xs transition-colors focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500",
							disabled && "cursor-not-allowed bg-slate-50 opacity-60",
						)}
						onClick={() => {
							if (!disabled) setIsOpen(true);
						}}
					>
						<input
							id={id}
							type="text"
							role="combobox"
							aria-expanded={isOpen}
							aria-label={label}
							disabled={disabled}
							autoComplete="off"
							value={isOpen ? query : displayLabel}
							placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
							onChange={(e) => {
								setQuery(e.target.value);
								if (!isOpen) setIsOpen(true);
							}}
							onFocus={() => {
								if (!disabled) setIsOpen(true);
							}}
							onKeyDown={handleKeyDown}
							className="h-full w-full bg-transparent outline-none placeholder:text-slate-400"
						/>
						<div className="flex shrink-0 items-center gap-1 pl-1 text-slate-400">
							{clearable && !disabled && value !== "all" && value !== "" && (
								<button
									type="button"
									tabIndex={-1}
									aria-label={`Clear ${label}`}
									onClick={handleClear}
									className="rounded-xs p-0.5 hover:bg-slate-100 hover:text-slate-600"
								>
									<XIcon className="h-3.5 w-3.5" />
								</button>
							)}
							<div className="p-0.5">
								<ChevronDownIcon
									className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", isOpen && "rotate-180")}
								/>
							</div>
						</div>
					</div>
				</PopoverAnchor>
				<PopoverContent
					align="start"
					sideOffset={4}
					style={{ width: triggerWidth ? `${triggerWidth}px` : undefined }}
					className="z-50 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-md"
					onOpenAutoFocus={(e) => {
						e.preventDefault();
					}}
				>
					<div role="listbox" aria-label={label} className="flex flex-col">
						{filteredOptions.length === 0 ? (
							<div className="px-3 py-2 text-center text-xs text-slate-400">No options found.</div>
						) : (
							filteredOptions.map((opt, idx) => {
								const isSelected = opt.value === value;
								const isHighlighted = idx === highlightedIndex;
								return (
									<div
										key={opt.value}
										role="option"
										aria-selected={isSelected}
										onClick={() => handleSelect(opt.value)}
										onMouseEnter={() => setHighlightedIndex(idx)}
										className={cn(
											"flex cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700",
											isSelected && "bg-sky-50 font-medium text-sky-700",
											isHighlighted && !isSelected && "bg-slate-100 text-slate-900",
										)}
									>
										<span>{opt.label}</span>
										{isSelected && <CheckIcon className="h-3.5 w-3.5 text-sky-600" />}
									</div>
								);
							})
						)}
					</div>
				</PopoverContent>
			</Popover>
		</FilterRow>
	);
}
