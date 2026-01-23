import { ReactNode } from "react";
import styled from "styled-components";

interface FilterFieldProps {
	label: string;
	required?: boolean;
	children: ReactNode;
}

export function FilterField({ label, required = false, children }: FilterFieldProps) {
	return (
		<FieldContainer>
			<FieldLabel>
				{required && <RequiredAsterisk>*</RequiredAsterisk>}
				{label}
			</FieldLabel>
			<FieldContent>{children}</FieldContent>
		</FieldContainer>
	);
}

//#region Styled Components
const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.palette.gray[700]};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RequiredAsterisk = styled.span`
  color: ${({ theme }) => theme.colors.palette.error.default};
`;

const FieldContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
//#endregion
