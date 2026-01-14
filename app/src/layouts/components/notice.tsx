import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import styled from "styled-components";

export default function NoticeButton() {
	const count = 4;

	return (
		<div className="relative">
			<StyledButton variant="ghost" size="icon" className="rounded-full">
				<Icon icon="solar:bell-bing-bold-duotone" size={24} />
			</StyledButton>
			<Badge variant="destructive" shape="circle" className="absolute -right-2 -top-2">
				{count}
			</Badge>
		</div>
	);
}

//#region Styled Components
const StyledButton = styled(Button)`
	color: ${({ theme }) => theme.colors.palette.gray[500]};
	svg {
		fill: ${({ theme }) => theme.colors.palette.gray[500]};
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.action.hover};
	}
`;
//#endregion
