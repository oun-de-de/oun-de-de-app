import { GLOBAL_CONFIG } from "@/global-config";
import { RouterLink } from "@/routes/components/router-link";
import { useSettings } from "@/store/settingStore";
import { ThemeLayout } from "@/types/enum";
import { rgbAlpha } from "@/utils/theme";
import styled from "styled-components";

export function NavVerticalHeader() {
	const { themeLayout } = useSettings();

	return (
		<StyledHeader $isMini={themeLayout === ThemeLayout.Mini}>
			<StyledTitleWrapper>
				<StyledTitleLink href="/" $isMini={themeLayout === ThemeLayout.Mini}>
					<StyledTitle $isMini={themeLayout === ThemeLayout.Mini}>
						{GLOBAL_CONFIG.appName}
					</StyledTitle>
				</StyledTitleLink>
			</StyledTitleWrapper>
		</StyledHeader>
	);
}

//#region Styled Components
const StyledHeader = styled.div<{ $isMini: boolean }>`
	position: relative;
	display: flex;
	align-items: center;
	padding: 1rem 0.5rem;
	height: var(--layout-header-height);
	border-bottom: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[200], 0.2)};
	justify-content: ${({ $isMini }) => ($isMini ? "center" : "flex-start")};
`;

const StyledTitleWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
`;

const StyledTitleLink = styled(RouterLink)<{ $isMini: boolean }>`
	text-decoration: none;
	cursor: pointer;
	display: ${({ $isMini }) => ($isMini ? "none" : "inline-block")};
`;

const StyledTitle = styled.span<{ $isMini: boolean }>`
	font-size: 1.25rem;
	font-weight: 700;
	transition: all 0.3s ease-in-out;
	white-space: nowrap;
	color: ${({ theme }) => theme.colors.text.primary};
`;
//#endregion