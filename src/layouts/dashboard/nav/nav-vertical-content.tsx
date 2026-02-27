import styled from "styled-components";
import { NavMini, NavVertical } from "@/core/components/nav";
import type { NavProps } from "@/core/components/nav/types";
import { useSettings } from "@/core/store/settingStore";
import { ThemeLayout } from "@/core/types/enum";
import { ScrollArea } from "@/core/ui/scroll-area";

type Props = {
	data: NavProps["data"];
};

export function NavVerticalContent({ data }: Props) {
	const { themeLayout } = useSettings();
	const isMini = themeLayout === ThemeLayout.Mini;

	// const actions = GLOBAL_CONFIG.routerMode === "frontend" ? frontendNewActions : backendNewActions;

	return (
		<StyledScrollArea>
			{/* <NavNewButton actions={actions} /> */}
			{isMini ? <NavMini data={data} /> : <NavVertical data={data} />}
		</StyledScrollArea>
	);
}

//#region Styled Components
const StyledScrollArea = styled(ScrollArea)`
	flex: 1;
	background-color: ${({ theme }) => theme.colors.common.black};
	padding: 0 0.5rem;
	padding-top: 8px;
`;
//#endregion
