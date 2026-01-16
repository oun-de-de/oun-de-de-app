import { useSettings } from "@/core/store/settingStore";
import type { ReactNode } from "react";
import styled from "styled-components";
import { rgbAlpha } from "@/core/utils/theme";
import BreadCrumb from "../components/bread-crumb";
import NavHistoryMenu from "../components/nav-history-menu";
import NoticeButton from "../components/notice";
import SettingButton from "../components/setting-button";

interface HeaderProps {
	leftSlot?: ReactNode;
}

export default function Header({ leftSlot }: HeaderProps) {
	const { breadCrumb } = useSettings();
	return (
		<StyledHeader data-slot="slash-layout-header">
			<StyledTopRow>
				<div className="flex items-center min-w-0">
					{leftSlot}
					<div className="hidden md:block ml-4">{breadCrumb && <BreadCrumb />}</div>
				</div>

				<div className="flex items-center gap-2 mr-2 flex-shrink-0">
					<SettingButton />
					<NoticeButton />
				</div>
			</StyledTopRow>

			<StyledBottomRow>
				<NavHistoryMenu />
			</StyledBottomRow>
		</StyledHeader>
	);
}

//#region Styled Components
const StyledHeader = styled.header`
	position: sticky;
	top: 0;
	left: 0;
	right: 0;
	z-index: 30;
	display: flex;
	flex-direction: column;
	justify-content: center;
	flex-grow: 0;
	flex-shrink: 0;
	background-color: ${({ theme }) => theme.colors.common.white};
	min-height: var(--layout-header-height);
	border-bottom: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
`;

const StyledTopRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 1rem;
	height: var(--layout-header-height);
	border-bottom: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
`;

const StyledBottomRow = styled.div`
	padding: 0.25rem 0;
`;
//#endregion
