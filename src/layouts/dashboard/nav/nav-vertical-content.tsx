import styled from "styled-components";
import { NavMini, NavNewButton, NavVertical } from "@/core/components/nav";
import type { NavProps } from "@/core/components/nav/types";
import { ScrollArea } from "@/core/ui/scroll-area";
import { GLOBAL_CONFIG } from "@/global-config";
import { newActions as backendNewActions } from "./nav-data/nav-data-backend";
import { newActions as frontendNewActions } from "./nav-data/nav-data-frontend";
import { useNavLayout } from "./nav-layout-context";

type Props = {
	data: NavProps["data"];
};

export function NavVerticalContent({ data }: Props) {
	const isMini = useNavLayout().isMini;

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
