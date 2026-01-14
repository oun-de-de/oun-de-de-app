import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import styled from "styled-components";

export default function SettingButton() {
	return (
		<StyledButton variant="ghost" size="icon" className="rounded-full">
					<Icon icon="solar:settings-outline" size={24} />
		</StyledButton>
	);
}

//#region Styled Components
const StyledButton = styled(Button)`
	color: ${({ theme }) => theme.colors.common.black};
	svg {
		fill: ${({ theme }) => theme.colors.palette.gray[500]};
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.action.hover};
	}
`;
//#endregion
