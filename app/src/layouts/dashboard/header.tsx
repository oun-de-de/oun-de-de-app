import { useSettings } from "@/store/settingStore";
import type { ReactNode } from "react";
import styled from "styled-components";
import { rgbAlpha } from "@/utils/theme";
import BreadCrumb from "../components/bread-crumb";
import NoticeButton from "../components/notice";
import SettingButton from "../components/setting-button";

interface HeaderProps {
	leftSlot?: ReactNode;
}

export default function Header({ leftSlot }: HeaderProps) {
	const { breadCrumb } = useSettings();
	return (
		<StyledHeader data-slot="slash-layout-header">
			<div className="flex items-center">
				{leftSlot}

				<div className="hidden md:block ml-4">{breadCrumb && <BreadCrumb />}</div>
			</div>

			<div className="flex items-center gap-2 mr-2">
				<SettingButton />
				<NoticeButton />
			</div>
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
	align-items: center;
	justify-content: space-between;
	padding: 0 1rem;
	flex-grow: 0;
	flex-shrink: 0;
	background-color: ${({ theme }) => theme.colors.common.white};
	height: var(--layout-header-height);
	border-bottom: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[500], 0.5)};
`;
//#endregion
