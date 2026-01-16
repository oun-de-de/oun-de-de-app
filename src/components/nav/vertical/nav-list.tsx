import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/core/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/core/ui/hover-card";
import { RouterLink } from "@/routes/components/router-link";
import { useState } from "react";
import { useLocation } from "react-router";
import type { NavListProps } from "../types";
import { NavItem } from "./nav-item";
import styled from "styled-components";

export function NavList({ data, depth = 1 }: NavListProps) {
	const location = useLocation();
	const isActive = location.pathname === data.path || (data.path !== "/" && location.pathname.startsWith(data.path + "/"));
	const [open, setOpen] = useState(isActive);
	const hasChild = data.children && data.children.length > 0;

	const handleClick = () => {
		if (hasChild) {
			setOpen(!open);
		}
	};

	if (data.hidden) {
		return null;
	}

	const navItem = (
		<NavItem
			// data
			title={data.title}
			path={data.path}
			icon={data.icon}
			info={data.info}
			caption={data.caption}
			auth={data.auth}
			// state
			open={open}
			active={isActive}
			disabled={data.disabled}
			// options
			hasChild={hasChild}
			depth={depth}
			// event
			onClick={handleClick}
		/>
	);

	const renderContent = () => {
		if (!data.actions || data.actions.length === 0) {
			return (
				<Collapsible open={open} onOpenChange={setOpen} data-nav-type="list">
					<CollapsibleTrigger className="w-full">{navItem}</CollapsibleTrigger>
					{hasChild && (
						<CollapsibleContent>
							<div className="ml-4 mt-1 flex flex-col gap-1">
								{data.children?.map((child) => (
									<NavList key={child.title} data={child} depth={depth + 1} />
								))}
							</div>
						</CollapsibleContent>
					)}
				</Collapsible>
			);
		}

		return (
			<HoverCard openDelay={100}>
				<Collapsible open={open} onOpenChange={setOpen} data-nav-type="list">
					<HoverCardTrigger asChild>
						<CollapsibleTrigger className="w-full">{navItem}</CollapsibleTrigger>
					</HoverCardTrigger>
					{hasChild && (
						<CollapsibleContent>
							<div className="ml-4 mt-1 flex flex-col gap-1">
								{data.children?.map((child) => (
									<NavList key={child.title} data={child} depth={depth + 1} />
								))}
							</div>
						</CollapsibleContent>
					)}
				</Collapsible>
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

	return renderContent();
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
