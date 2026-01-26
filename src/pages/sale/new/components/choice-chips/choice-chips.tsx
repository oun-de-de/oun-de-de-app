import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Icon } from "@/core/components/icon";
import { cn } from "@/core/utils";
import { SaleCategory } from "@/core/domain/sales/entities/sale-category";

interface ChoiceChipsProps {
	options: SaleCategory[];
	value: SaleCategory[];
	onChange: (next: SaleCategory[]) => void;
	className?: string;
}

export function ChoiceChips({ options, value, onChange, className }: ChoiceChipsProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const updateScrollState = () => {
		const el = scrollRef.current;
		if (!el) return;
		const { scrollLeft, clientWidth, scrollWidth } = el;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
	};

	const scrollByAmount = (delta: number) => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: delta, behavior: "smooth" });
	};

	const orderedValue = useMemo(() => {
		const set = new Set(value.map((v) => v.id));
		return options.filter((opt) => set.has(opt.id)).map((opt) => opt.id);
	}, [options, value]);

	const toggleValue = (id: string) => {
		const exists = orderedValue.includes(id);
		let next: SaleCategory[];
		if (exists) {
			next = value.filter((cat) => cat.id !== id);
		} else {
			const found = options.find((cat) => cat.id === id);
			next = found ? [...value, found] : value;
		}
		onChange(next);
	};

	useEffect(() => {
		updateScrollState();
	}, [options, value]);

	const handleScroll = () => updateScrollState();

	return (
		<Wrapper className={cn(className, "px-2")}>
			{canScrollLeft && (
				<ArrowButton $side="left" type="button" onClick={() => scrollByAmount(-160)}>
					<Icon icon="mdi:chevron-left" size={16} />
				</ArrowButton>
			)}

			<ScrollArea ref={scrollRef} onScroll={handleScroll}>
				{options.map(({ id, name }) => (
					<Chip key={id} type="button" $active={orderedValue.includes(id)} onClick={() => toggleValue(id)}>
						{name}
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
