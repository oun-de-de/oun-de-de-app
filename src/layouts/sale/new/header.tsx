import styled from "styled-components";
import { rgbAlpha } from "@/core/utils/theme";
import { Icon } from "@/core/components/icon";
import NoticeButton from "@/layouts/components/notice";
import ScreenControl from "@/layouts/components/screen-control";
import { Link } from "react-router";

interface SaleHeaderProps {
	title?: string;
}

export default function SaleHeader({ title }: SaleHeaderProps) {
	return (
		<StyledHeader data-slot="sale-layout-header">
			<StyledTopRow>
				<Link to="/" className="flex items-center gap-2 flex-shrink-0 text-black hover:opacity-80 transition-opacity">
					<Icon icon="lucide:menu" size={24} />
					<span className="text-2xl font-bold">MICRO</span>
				</Link>

				<div className="flex-1 flex items-center justify-center">
					<StyledTitle>{title}</StyledTitle>
				</div>

				<div className="flex items-center gap-2 flex-shrink-0 mr-2">
					<ScreenControl />
					<NoticeButton />
				</div>
			</StyledTopRow>
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
`;

const StyledTitle = styled.div`
	font-size: 1.5rem;
	font-weight: bold;
	color: ${({ theme }) => theme.colors.palette.warning.dark};
`;
//#endregion
