import { memo, useCallback } from "react";
import styled, { css } from "styled-components";
import Icon from "@/core/components/icon/icon";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";

export type MenuItemProps = {
	label: string;
	isActive: boolean;
	onSelect: (item: string) => void;
	icon?: string;
	badgeLabel?: string;
};

const StyledButton = styled(Button)<{ $isActive: boolean }>`
	justify-content: flex-start;
	letter-spacing: 0.025em;
	padding: 0.60rem;

	${({ $isActive }) =>
		$isActive &&
		css`
			background-color: rgb(2 132 199);
			color: white;

			&:hover {
				background-color: rgb(2 132 199 / 0.9);
			}
	`}
`;

export const MenuItem = memo(function MenuItem({
	label,
	isActive,
	onSelect,
	icon = "mdi:checkbox-blank-circle-outline",
	badgeLabel,
}: MenuItemProps) {
	const handleClick = useCallback(() => onSelect(label), [label, onSelect]);

	return (
		<StyledButton variant="ghost" size="sm" onClick={handleClick} $isActive={isActive}>
			<Icon icon={icon} className="mr-2 text-sm" />
			<span className="min-w-0 flex-1 truncate text-left">{label}</span>
			{badgeLabel ? (
				<Badge
					variant={isActive ? "secondary" : "outline"}
					className="ml-2 shrink-0 text-[10px] uppercase tracking-wide"
				>
					{badgeLabel}
				</Badge>
			) : null}
		</StyledButton>
	);
});
