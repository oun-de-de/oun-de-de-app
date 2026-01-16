import type { NavItemProps } from "../types";
import { StyledNavItem, StyledNavItemLink } from "../styles/nav-item-styled";

type NavItemRendererProps = {
	item: NavItemProps;
	className?: string;
	children: React.ReactNode;
};

/**
 * Renderer for Navigation Items.
 * Handles disabled, external link, clickable child container, and internal link logic.
 */
export const NavItemRenderer: React.FC<NavItemRendererProps> = ({ item, className, children }) => {
	const { disabled, hasChild, path, onClick, active, depth } = item;

	const styledProps = {
		$active: active,
		$disabled: disabled,
		$depth: depth,
		$hasChild: hasChild,
	};

	if (disabled) {
		return (
			<StyledNavItem {...styledProps} className={className}>
				{children}
			</StyledNavItem>
		);
	}

	if (hasChild) {
		// Vertical nav items with children are clickable containers
		return (
			<StyledNavItem {...styledProps} className={className} onClick={onClick}>
				{children}
			</StyledNavItem>
		);
	}

	// Default: internal link
	return (
		<StyledNavItemLink {...styledProps} href={path} className={className}>
			{children}
		</StyledNavItemLink>
	);
};
