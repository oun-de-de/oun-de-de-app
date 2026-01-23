import styled from "styled-components";
import { ChangeEvent } from "react";
import { Icon } from "@/core/components/icon";
import { Input as BaseInput } from "@/core/ui/input";

interface SearchInputProps {
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	className?: string;
}

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
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

export function SearchInput({ value, onChange, placeholder = "Search...", className }: SearchInputProps) {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);

	return (
		<Wrapper className={className}>
			<Input
				id="search-input"
				name="search"
				autoComplete="off"
				value={value}
				onChange={handleChange}
				placeholder={placeholder}
			/>
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
