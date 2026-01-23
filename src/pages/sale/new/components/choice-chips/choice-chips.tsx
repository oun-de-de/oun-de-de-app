import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Icon } from "@/core/components/icon";

export type ChoiceChipOption = {
	label: string;
	value: string;
	disabled?: boolean;
};

interface ChoiceChipsProps {
	options: ChoiceChipOption[];
	value: string[];
	onChange: (next: string[]) => void;
	className?: string;
}

export function ChoiceChips({ options, value, onChange, className }: ChoiceChipsProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const orderedValue = useMemo(() => {
		const set = new Set(value);
		return options.filter((opt) => set.has(opt.value)).map((opt) => opt.value);
	}, [options, value]);

	const toggleValue = (v: string) => {
		const exists = orderedValue.includes(v);
		const next = exists ? orderedValue.filter((x) => x !== v) : [...orderedValue, v];
		onChange(next);
	};

	const updateScrollState = () => {
		const el = scrollRef.current;
		if (!el) return;
		const { scrollLeft, clientWidth, scrollWidth } = el;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
	};

	useEffect(() => {
		updateScrollState();
	}, [options, value]);

	const handleScroll = () => updateScrollState();

	const scrollByAmount = (delta: number) => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: delta, behavior: "smooth" });
	};

	return (
		<Wrapper className={className}>
			{canScrollLeft && (
				<ArrowButton $side="left" type="button" onClick={() => scrollByAmount(-160)}>
					<Icon icon="mdi:chevron-left" size={16} />
				</ArrowButton>
			)}

			<ScrollArea ref={scrollRef} onScroll={handleScroll}>
				{options.map(({ label, value: v, disabled }) => (
					<Chip
						key={v}
						type="button"
						$active={orderedValue.includes(v)}
						disabled={disabled}
						onClick={() => toggleValue(v)}
					>
						{label}
					</Chip>
				))}
			</ScrollArea>

			{canScrollRight && (
				<ArrowButton $side="right" type="button" onClick={() => scrollByAmount(160)}>
					<Icon icon="mdi:chevron-right" size={16} />
				</ArrowButton>
			)}
		</Wrapper>
	);
}

//#region Styled Components
const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ScrollArea = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Chip = styled.button<{ $active: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.palette.gray[300]};
  border-radius: 3px;
  background-color: ${({ theme, $active }) =>
		$active ? theme.colors.palette.info.default : theme.colors.common.white};
  color: ${({ theme, $active }) => ($active ? theme.colors.common.white : theme.colors.palette.gray[700])};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme, $active }) =>
			$active ? theme.colors.palette.info.default : theme.colors.palette.gray[100]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ArrowButton = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ $side }) => ($side === "left" ? "left: 0;" : "right: 0;")}
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.colors.palette.gray[300]};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.common.white};
  color: ${({ theme }) => theme.colors.palette.gray[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

  &:hover {
    background: ${({ theme }) => theme.colors.palette.gray[100]};
  }
`;
//#endregion
