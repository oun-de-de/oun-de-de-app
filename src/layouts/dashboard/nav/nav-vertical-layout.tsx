import styled from "styled-components";
import type { NavProps } from "@/core/components/nav/types";
import { cn } from "@/core/utils";
import { useNavLayout } from "./nav-layout-context";
import { NavVerticalContent } from "./nav-vertical-content";
import { NavVerticalFooter } from "./nav-vertical-footer";
import { NavVerticalHeader } from "./nav-vertical-header";

type Props = {
	data: NavProps["data"];
	className?: string;
};

export function NavVerticalLayout({ data, className }: Props) {
	const isMini = useNavLayout().isMini;
	const navWidth = isMini ? "var(--layout-nav-width-mini)" : "var(--layout-nav-width)";

	return (
		<StyledNav $width={navWidth} className={cn("print:hidden", className)} data-slot="slash-layout-nav">
			<NavVerticalHeader />
			<NavVerticalContent data={data} />
			<NavVerticalFooter />
		</StyledNav>
	);
}

//#region Styled Components
const StyledNav = styled.nav<{ $width: string }>`
	position: fixed;
	top: 0;
	bottom: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	height: 100%;
	width: ${({ $width }) => $width};
	background-color: ${({ theme }) => theme.colors.common.black};
	z-index: 20;
	transition: width 0.3s ease-in-out;
`;
//#endregion
