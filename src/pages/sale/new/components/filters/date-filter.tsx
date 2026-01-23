import styled from "styled-components";
import dayjs from "dayjs";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/core/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/ui/popover";
import { Icon } from "@/core/components/icon";
import { FilterField } from "./filter-field";
import { Button } from "@/core/ui/button";

const DateInputContainer = styled.div`
  position: relative;  
`;

const DateTrigger = styled(Button)`
  width: 100%;
  height: 36px;
  padding: 6px 12px;
  padding-right: 80px;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.common.white};
  }

  &:focus-visible, &:focus-within {
    box-shadow: var(--ids-sem-ring-focus);
  }
`;

const DateValue = styled.span`
  color: ${({ theme }) => theme.colors.palette.gray[500]};
`;

const IconWrapper = styled.span`
  color: ${({ theme }) => theme.colors.palette.gray[500]};
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const ClearButton = styled.span`
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.palette.gray[400]};
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.palette.gray[600]};
  }
`;

const CalendarIcon = styled(IconWrapper)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`;

type DateLike = string | Date | ReturnType<typeof dayjs>;
type DateRangeValue = { from?: DateLike; to?: DateLike };

type SingleProps = {
	mode?: "single";
	value: DateLike;
	onChange: (value: DateLike) => void;
};

type RangeProps = {
	mode: "range";
	value: DateRangeValue;
	onChange: (value: DateRangeValue) => void;
};

type DateFilterProps = (SingleProps | RangeProps) & {
	format?: "DD/MM/YYYY" | "Date" | "dayjs";
};

export function DateFilter(props: DateFilterProps) {
	const { format = "DD/MM/YYYY" } = props;
	const mode = props.mode ?? "single";
	const isRangeMode = mode === "range";
	const currentYear = new Date().getFullYear();

	const toDate = (input?: DateLike) => {
		if (!input) return undefined;
		if (typeof input === "string") {
			const parsed = dayjs(input, "DD/MM/YYYY");
			return parsed.isValid() ? parsed.toDate() : undefined;
		}
		if (input instanceof Date) return input;
		const parsed = dayjs(input);
		return parsed.isValid() ? parsed.toDate() : undefined;
	};

	const formatDate = (input?: DateLike) => {
		if (!input) return "";
		if (typeof input === "string") return input;
		if (input instanceof Date) return dayjs(input).format("DD/MM/YYYY");
		return dayjs(input).format("DD/MM/YYYY");
	};

	const getSelectedDate = () => {
		if (isRangeMode) return undefined;
		return toDate((props as SingleProps).value);
	};

	const getSelectedRange = (): DateRange | undefined => {
		if (!isRangeMode) return undefined;
		const { value } = props as RangeProps;
		return {
			from: toDate(value.from),
			to: toDate(value.to),
		};
	};

	const getDisplayValue = () => {
		if (!isRangeMode) {
			return formatDate((props as SingleProps).value);
		}
		const { value } = props as RangeProps;
		const from = formatDate(value.from);
		const to = formatDate(value.to);
		if (from && to) return `${from} - ${to}`;
		return from || to || "";
	};

	const handleRangeSelect = (selected?: DateRange) => {
		if (!isRangeMode) return;
		if (!selected) return;

		const mapValue = (d?: Date) => {
			if (!d) return undefined;
			if (format === "DD/MM/YYYY") return dayjs(d).format("DD/MM/YYYY");
			if (format === "Date") return d;
			return dayjs(d);
		};

		const rangeValue: DateRangeValue = {
			from: mapValue(selected.from),
			to: mapValue(selected.to),
		};
		(props as RangeProps).onChange(rangeValue);
	};

	const handleSingleSelect = (selected?: Date) => {
		if (isRangeMode) return;
		if (!selected) return;

		if (format === "DD/MM/YYYY") {
			(props as SingleProps).onChange(dayjs(selected).format("DD/MM/YYYY"));
		} else if (format === "Date") {
			(props as SingleProps).onChange(selected);
		} else if (format === "dayjs") {
			(props as SingleProps).onChange(dayjs(selected));
		}
	};

	const displayValue = getDisplayValue();

	const clearValue = () => {
		if (isRangeMode) {
			(props as RangeProps).onChange({ from: undefined, to: undefined });
			return;
		}
		(props as SingleProps).onChange("" as DateLike);
	};

	return (
		<FilterField label="Date" required>
			<Popover>
				<PopoverTrigger asChild>
					<DateInputContainer>
						<DateTrigger variant="outline">
							<DateValue>{displayValue || "Select date"}</DateValue>
							{displayValue ? (
								<ClearButton
									role="button"
									aria-label="Clear date"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										clearValue();
									}}
								>
									<IconWrapper>
										<Icon icon="mdi:close-circle" size={18} />
									</IconWrapper>
								</ClearButton>
							) : null}
							<CalendarIcon>
								<Icon icon="mdi:calendar" size={18} />
							</CalendarIcon>
						</DateTrigger>
					</DateInputContainer>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					{isRangeMode ? (
						<Calendar
							mode="range"
							selected={getSelectedRange()}
							onSelect={handleRangeSelect}
							captionLayout="dropdown"
							fromYear={2000}
							toYear={currentYear + 10}
							initialFocus
						/>
					) : (
						<Calendar
							mode="single"
							selected={getSelectedDate()}
							onSelect={handleSingleSelect}
							captionLayout="dropdown"
							fromYear={2000}
							toYear={currentYear + 10}
							initialFocus
						/>
					)}
				</PopoverContent>
			</Popover>
		</FilterField>
	);
}
