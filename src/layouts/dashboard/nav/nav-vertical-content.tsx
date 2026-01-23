import { NavMini, NavVertical } from "@/core/components/nav";
import { NavNewButton } from "@/core/components/nav/components";
import type { NavProps } from "@/core/components/nav/types";
import { GLOBAL_CONFIG } from "@/global-config";
import { useSettings } from "@/core/store/settingStore";
import { ThemeLayout } from "@/core/types/enum";
import { ScrollArea } from "@/core/ui/scroll-area";
import { newActions as backendNewActions } from "./nav-data/nav-data-backend";
import { newActions as frontendNewActions } from "./nav-data/nav-data-frontend";
import styled from "styled-components";

type Props = {
	data: NavProps["data"];
};

export function NavVerticalContent({ data }: Props) {
	const { themeLayout } = useSettings();
	const isMini = themeLayout === ThemeLayout.Mini;

	const actions = GLOBAL_CONFIG.routerMode === "frontend" ? frontendNewActions : backendNewActions;

	return (
		<StyledScrollArea>
			<NavNewButton actions={actions} />
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
