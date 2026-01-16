import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/core/ui/hover-card";
import { RouterLink } from "@/routes/components/router-link";
import { useLocation } from "react-router";
import type { NavListProps } from "../types";
import { NavRootItem } from "./nav-root-item";
import { NavSubItem } from "./nav-sub-item";
import styled from "styled-components";

export function NavList({ data, depth = 0 }: NavListProps) {
	const hasChild = data.children && data.children.length > 0;
	const location = useLocation();
	const isActive = location.pathname === data.path || (data.path !== "/" && location.pathname.startsWith(data.path + "/"));

	if (data.hidden) {
		return null;
	}

	const renderRootNavItem = () => {
		return (
			<NavRootItem
				key={data.title}
				// data
				path={data.path}
				title={data.title}
				caption={data.caption}
				info={data.info}
				icon={data.icon}
				auth={data.auth}
				// state
				disabled={data.disabled}
				active={isActive}
				// options
				hasChild={hasChild}
				depth={depth}
			/>
		);
	};

	const renderSubNavItem = () => {
		return (
			<NavSubItem
				key={data.title}
				// data
				path={data.path}
				title={data.title}
				caption={data.caption}
				info={data.info}
				icon={data.icon}
				auth={data.auth}
				// state
				disabled={data.disabled}
				active={isActive}
				// options
				hasChild={hasChild}
				depth={depth}
			/>
		);
	};

	const renderNavItem = () => (depth === 1 ? renderRootNavItem() : renderSubNavItem());

	const renderRootItemWithHoverCard = () => {
		return (
			<HoverCard openDelay={100}>
				<HoverCardTrigger asChild>
					<div>{renderNavItem()}</div>
				</HoverCardTrigger>
				<HoverCardContent side="right" sideOffset={10} className="p-1">
					<StyledPopoverList>
						{data.children?.map((child) => (
							<NavList key={child.title} data={child} depth={depth + 1} />
						))}
					</StyledPopoverList>
				</HoverCardContent>
			</HoverCard>
		);
	};

	const renderNavItemWithPopover = () => {
		const navItem = renderNavItem();
		
		if (!data.actions || data.actions.length === 0) {
			return navItem;
		}

		return (
			<HoverCard openDelay={100}>
				<HoverCardTrigger asChild>
					<div>{navItem}</div>
				</HoverCardTrigger>
				<HoverCardContent side="right" align="start" sideOffset={10} className="p-1">
					<StyledPopoverList>
						{data.actions.map((item, index) => (
							<StyledPopoverItem key={index}>
								{item.path ? (
									<StyledPopoverLink href={item.path} onClick={item.onClick}>
										{item.title}
									</StyledPopoverLink>
								) : (
									<StyledPopoverButton onClick={item.onClick}>
										{item.title}
									</StyledPopoverButton>
								)}
							</StyledPopoverItem>
						))}
					</StyledPopoverList>
				</HoverCardContent>
			</HoverCard>
		);
	};

	if (hasChild) {
		return <li className="list-none">{renderRootItemWithHoverCard()}</li>;
	}

	return <li className="list-none">{renderNavItemWithPopover()}</li>;
}

//#region Styled Components
const StyledPopoverList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 0;
`;

const StyledPopoverItem = styled.li`
	padding: 0;
	margin: 0;
`;

const StyledPopoverLink = styled(RouterLink as any)`
	display: block;
	padding: 0.5rem 0.75rem;
	color: ${({ theme }) => theme.colors.common.black};
	text-decoration: none;
	font-size: 0.875rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
	background-color: ${({ theme }) => theme.colors.common.white};

	&:hover {
		background-color: ${({ theme }) => theme.colors.palette.gray[200]};
	}
`;

const StyledPopoverButton = styled.button`
	display: block;
	width: 100%;
	padding: 0.5rem 0.75rem;
	color: ${({ theme }) => theme.colors.common.black};
	text-decoration: none;
	font-size: 0.875rem;
	border-radius: 0.25rem;
	transition: background-color 0.2s ease;
	background-color: ${({ theme }) => theme.colors.common.white};
	border: none;
	text-align: left;
	cursor: pointer;

	&:hover {
		background-color: ${({ theme }) => theme.colors.palette.gray[200]};
	}
`;
//#endregion
