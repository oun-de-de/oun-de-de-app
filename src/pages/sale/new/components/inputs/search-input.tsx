import styled from "styled-components";
import { ChangeEvent, useDeferredValue, useEffect, useRef, useState } from "react";
import { Icon } from "@/core/components/icon";
import { Input as BaseInput } from "@/core/ui/input";
import { cn } from "@/core/utils";
import { ClearIconButton } from "../button/clear-button";
import { useUpdateEffect } from "react-use";

interface SearchInputProps {
	defaultValue?: string;
	onSearchChange?: (val: string) => void;
	onDeferredSearchChange?: (val: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchInput({
	defaultValue = "",
	onSearchChange,
	onDeferredSearchChange,
	placeholder = "Search...",
	className,
}: SearchInputProps) {
	const [value, setValue] = useState(defaultValue);
	const deferredValue = useDeferredValue(value);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		onSearchChange?.(value);
	}, [value, onSearchChange]);

	useUpdateEffect(() => {
		if (!onDeferredSearchChange) return;

		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		timerRef.current = window.setTimeout(() => {
			onDeferredSearchChange(deferredValue);
		}, 300);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [deferredValue, onDeferredSearchChange]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	const handleClear = () => {
		setValue("");
	};

	return (
		<Wrapper className={cn(className, "px-1")}>
			<Input
				id="search-input"
				name="search"
				autoComplete="off"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
			/>

			{value && (
				<ClearIconButton
					onClick={handleClear}
					ariaLabel="Clear search"
					style={{
						position: "absolute",
						right: 72,
						top: "50%",
						transform: "translateY(-50%)",
					}}
				/>
			)}

			<IconButton type="button">
				<IconStack>
					<Icon icon="mdi:account" size={18} />
					<span className="secondary">
						<Icon icon="mdi:cog" size={14} />
					</span>
				</IconStack>
			</IconButton>
		</Wrapper>
	);
}

//#region Styled Components
const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const Input = styled(BaseInput)`
  height: 38px;
`;

const IconButton = styled.button`
  width: 48px;
  height: 38px;
  border: 1px solid ${({ theme }) => theme.colors.palette.gray[300]};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.common.white};
  color: ${({ theme }) => theme.colors.palette.gray[600]};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.palette.gray[100]};
  }
`;

const IconStack = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .secondary {
    position: absolute;
    right: -6px;
    bottom: -6px;
  }
`;
//#endregion
