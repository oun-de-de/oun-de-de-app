import { memo, useCallback } from "react";
import styled, { css } from "styled-components";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";

export type MenuItemProps = {
	label: string;
	isActive: boolean;
	onSelect: (item: string) => void;
	isCollapsed?: boolean;
};

function getCollapsedLabel(label: string): string {
	const words = label.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return "?";
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const ICONS = {
	active: "mdi:checkbox-blank-circle",
	inactive: "mdi:checkbox-blank-circle-outline",
} as const;

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

export const MenuItem = memo(function MenuItem({ label, isActive, onSelect, isCollapsed }: MenuItemProps) {
	const handleClick = useCallback(() => onSelect(label), [label, onSelect]);

	if (isCollapsed) {
		return (
			<StyledButton
				variant="ghost"
				size="icon"
				onClick={handleClick}
				$isActive={isActive}
				className="mb-1 h-9 w-9 justify-center rounded-lg px-0 text-xs font-semibold tracking-wide"
				title={label}
			>
				<span>{getCollapsedLabel(label)}</span>
			</StyledButton>
		);
	}

	return (
		<StyledButton variant="ghost" size="sm" onClick={handleClick} $isActive={isActive}>
			<Icon icon={isActive ? ICONS.active : ICONS.inactive} className="mr-2 text-xs" />
			{label}
		</StyledButton>
	);
});
