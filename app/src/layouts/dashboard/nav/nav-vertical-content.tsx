import { Icon } from "@/components/icon";
import { NavMini, NavVertical } from "@/components/nav";
import type { NavProps } from "@/components/nav/types";
import { useSettings } from "@/store/settingStore";
import { ThemeLayout } from "@/types/enum";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import styled from "styled-components";

type Props = {
	data: NavProps["data"];
};

export function NavVerticalContent({ data }: Props) {
	const { themeLayout } = useSettings();

	const isMini = themeLayout === ThemeLayout.Mini;

	return (
		<StyledScrollArea>
			<StyledButton variant="outline" size="sm" $isMini={isMini}>
				<Icon icon="lucide:plus" size={16} />
				{!isMini && "New"}
			</StyledButton>
			{isMini ? <NavMini data={data} /> : <NavVertical data={data} />}
		</StyledScrollArea>
	);
}

//#region Styled Components
const StyledScrollArea = styled(ScrollArea)`
	flex: 1;
	background-color: ${({ theme }) => theme.colors.background.default};
	padding: 0 0.5rem;
	padding-top: 8px;
`;

const StyledButton = styled(Button)<{ $isMini: boolean }>`
	width: 100%;
	height: 42px;
	margin-bottom: 8px;
	border-color: ${({ theme }) => theme.colors.common.white};
	color: ${({ theme }) => theme.colors.common.white};
	font-size: 0.875rem;
	font-weight: 500;
	justify-content: center;

	&:hover {
		background-color: ${({ theme }) => theme.colors.common.white};
		color: ${({ theme }) => theme.colors.palette.gray[800]};
		border-color: ${({ theme }) => theme.colors.common.white};
	}
`;
//#endregion