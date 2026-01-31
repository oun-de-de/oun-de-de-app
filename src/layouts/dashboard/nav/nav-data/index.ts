import type { NavItemDataProps } from "@/core/components/nav/types";
import { GLOBAL_CONFIG } from "@/global-config";
import { useUserRoles } from "@/core/services/auth/hooks/use-auth";
// import { checkAny } from "@/core/utils";
import { useMemo } from "react";
import { backendNavData } from "./nav-data-backend";
import { frontendNavData } from "./nav-data-frontend";

const navData = GLOBAL_CONFIG.routerMode === "backend" ? backendNavData : frontendNavData;

/**
 * Recursively process navigation items and filter out items without permissions/roles
 * @param items Navigation items array
 * @param permissions Permissions list
 * @param roles Roles list
 * @returns Filtered navigation items array
 */
const filterItems = (items: NavItemDataProps[], permissions: string[], roles: string[]) => {
	return items.filter((item) => {
		// Check if current item has required roles
		const hasRole = true; //item.roles ? checkAny(item.roles, roles) : true;

		// If there are child items, process recursively
		if (item.children?.length) {
			const filteredChildren = filterItems(item.children, permissions, roles);
			// If all child items are filtered out, filter out the current item
			if (filteredChildren.length === 0) {
				return false;
			}
			// Update child items
			item.children = filteredChildren;
		}

		return hasRole;
	});
};

/**
 * Filter navigation data based on permissions and roles
 * @param permissions Permissions list
 * @param roles Roles list
 * @returns Filtered navigation data
 */
const filterNavData = (permissions: string[], roles: string[]) => {
	return navData
		.map((group) => {
			// Filter items within the group
			const filteredItems = filterItems(group.items, permissions, roles);

			// If there are no items in the group, return null
			if (filteredItems.length === 0) {
				return null;
			}

			// Return the filtered group
			return {
				...group,
				items: filteredItems,
			};
		})
		.filter((group): group is NonNullable<typeof group> => group !== null); // Filter out empty groups
};

/**
 * Hook to get filtered navigation data based on user permissions and roles
 * @returns Filtered navigation data
 */
export const useFilteredNavData = () => {
	const roles = useUserRoles();
	const roleCodes = useMemo(() => roles.map((r) => r), [roles]);
	const filteredNavData = useMemo(() => filterNavData([], roleCodes), [roleCodes]);
	return filteredNavData;
};
