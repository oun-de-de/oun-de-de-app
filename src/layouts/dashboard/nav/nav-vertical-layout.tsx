import type { NavProps } from "@/core/components/nav/types";
import { useSettings } from "@/core/store/settingStore";
import { ThemeLayout } from "@/core/types/enum";
import styled from "styled-components";
import { NavVerticalHeader } from "./nav-vertical-header";
import { NavVerticalContent } from "./nav-vertical-content";
import { NavVerticalFooter } from "./nav-vertical-footer";

type Props = {
	data: NavProps["data"];
	className?: string;
};

export function NavVerticalLayout({ data, className }: Props) {
	const { themeLayout } = useSettings();
	const navWidth = themeLayout === ThemeLayout.Vertical ? "var(--layout-nav-width)" : "var(--layout-nav-width-mini)";

	return (
		<StyledNav $width={navWidth} className={className} data-slot="slash-layout-nav">
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
	background-color: ${({ theme }) => theme.colors.background.default};
	z-index: 20;
	transition: width 0.3s ease-in-out;
`;
//#endregion
