import styled from "styled-components";
import { Icon } from "@/core/components/icon";
import Logo from "@/core/components/logo";
import { down, useMediaQuery } from "@/core/hooks";
import { useSettingActions, useSettings } from "@/core/store/settingStore";
import { ThemeLayout } from "@/core/types/enum";
import { Button } from "@/core/ui/button";
import Header from "./header";
import Main from "./main";
import { NavHorizontalLayout, NavMobileLayout, NavVerticalLayout, useFilteredNavData } from "./nav";

export default function DashboardLayout() {
	const isMobile = useMediaQuery(down("md"));

	return (
		<div data-slot="slash-layout-root" className="w-full min-h-screen bg-neutral-50">
			{isMobile ? <MobileLayout /> : <PcLayout />}
		</div>
	);
}

function MobileLayout() {
	const navData = useFilteredNavData();
	return (
		<>
			{/* Sticky Header */}
			<Header leftSlot={<NavMobileLayout data={navData} />} />
			<Main />
		</>
	);
}

function PcLayout() {
	const { themeLayout } = useSettings();

	if (themeLayout === ThemeLayout.Horizontal) return <PcHorizontalLayout />;
	return <PcVerticalLayout />;
}

function PcHorizontalLayout() {
	const navData = useFilteredNavData();
	return (
		<>
			{/* Sticky Header */}
			<Header leftSlot={<Logo />} />
			{/* Sticky Nav */}
			<NavHorizontalLayout data={navData} />

			<Main />
		</>
	);
}

function PcVerticalLayout() {
	const settings = useSettings();
	const { themeLayout } = settings;
	const { setSettings } = useSettingActions();
	const navData = useFilteredNavData();

	const mainPaddingLeft =
		themeLayout === ThemeLayout.Vertical ? "var(--layout-nav-width)" : "var(--layout-nav-width-mini)";

	const handleToggle = () => {
		setSettings({
			...settings,
			themeLayout: themeLayout === ThemeLayout.Mini ? ThemeLayout.Vertical : ThemeLayout.Mini,
		});
	};

	return (
		<>
			{/* Fixed Header */}
			<NavVerticalLayout data={navData} />

			<div
				className="relative w-full h-screen overflow-hidden flex flex-col transition-[padding] duration-300 ease-in-out"
				style={{
					paddingLeft: mainPaddingLeft,
				}}
			>
				<Header
					leftSlot={
						<StyledToggleButton variant="ghost" size="icon" onClick={handleToggle}>
							<Icon icon="lucide:menu" size={20} />
						</StyledToggleButton>
					}
				/>
				<Main />
			</div>
		</>
	);
}

//#region Styled Components
const StyledToggleButton = styled(Button)`
	background-color: ${({ theme }) => theme.colors.common.white};
	color: ${({ theme }) => theme.colors.common.black};

	&:hover {
		background-color: ${({ theme }) => theme.colors.common.white};
		color: ${({ theme }) => theme.colors.common.black};
	}

	svg {
		fill: ${({ theme }) => theme.colors.common.black};
		color: ${({ theme }) => theme.colors.common.black};
	}
`;
//#endregion
