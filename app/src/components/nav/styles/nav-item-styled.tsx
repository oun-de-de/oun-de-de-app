import styled from "styled-components";
import { RouterLink } from "@/routes/components/router-link";

type StyledNavItemProps = {
	$active?: boolean;
	$disabled?: boolean;
	$depth?: number;
	$hasChild?: boolean;
};

const baseNavItemStyles = `
	display: inline-flex;
	width: 100%;
	align-items: center;
	align-content: center;
	border-radius: 0.375rem;
	padding: 0.375rem 0.5rem;
	font-size: 0.875rem;
	min-height: 44px;
	transition: all 0.3s ease-in-out;
`;

export const StyledNavItem = styled.div<StyledNavItemProps>`
	${baseNavItemStyles}
	color: ${({ theme, $active, $disabled, $depth }) => {
		if ($disabled) return theme.colors.text.disabled;
		if ($active && $depth === 1) return theme.colors.palette.gray[800];
		return theme.colors.text.primary;
	}};
	cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};

	&:hover {
		background-color: ${({ theme, $disabled, $active, $depth }) => {
			if ($disabled) return "transparent";
			if ($active && $depth === 1) return theme.colors.common.white;
			if ($active && $depth !== 1) return theme.colors.action.hover;
			return theme.colors.action.hover;
		}};
	}

	background-color: ${({ theme, $active, $depth }) => {
		if ($active && $depth === 1) return theme.colors.common.white;
		if ($active && $depth !== 1) return theme.colors.action.hover;
		return "transparent";
	}};
`;

export const StyledNavItemLink = styled(RouterLink as any).withConfig({
	shouldForwardProp: (prop) => !prop.startsWith("$"),
})<StyledNavItemProps>`
	${baseNavItemStyles}
	color: ${({ theme, $active, $disabled, $depth }) => {
		if ($disabled) return theme.colors.text.disabled;
		if ($active && $depth === 1) return theme.colors.palette.gray[800];
		return theme.colors.text.primary;
	}} !important;
	cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
	text-decoration: none !important;
	background-color: ${({ theme, $active, $depth }) => {
		if ($active && $depth === 1) return theme.colors.common.white;
		if ($active && $depth !== 1) return theme.colors.action.hover;
		return "transparent";
	}} !important;
	outline: none;

	&:hover {
		color: ${({ theme, $active, $disabled, $depth }) => {
			if ($disabled) return theme.colors.text.disabled;
			if ($active && $depth === 1) return theme.colors.palette.gray[800];
			return theme.colors.text.primary;
		}} !important;
		background-color: ${({ theme, $disabled, $active, $depth }) => {
			if ($disabled) return "transparent";
			if ($active && $depth === 1) return theme.colors.common.white;
			if ($active && $depth !== 1) return theme.colors.action.hover;
			return theme.colors.action.hover;
		}} !important;
		text-decoration: none !important;
	}

	&:visited,
	&:active,
	&:focus {
		color: ${({ theme, $active, $disabled, $depth }) => {
			if ($disabled) return theme.colors.text.disabled;
			if ($active && $depth === 1) return theme.colors.palette.gray[800];
			return theme.colors.text.primary;
		}} !important;
		text-decoration: none !important;
	}
`;
