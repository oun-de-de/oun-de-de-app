import { useIsAuthenticated, useUserPermissions, useUserRoles } from "@/core/services/auth/hooks/use-auth";

/**
 * permission/role check hook
 * @param baseOn - check type: 'role' or 'permission'
 *
 * @example
 * // permission check
 * const { check, checkAny, checkAll } = useAuthCheck('permission');
 * check('user.create')
 * checkAny(['user.create', 'user.edit'])
 * checkAll(['user.create', 'user.edit'])
 *
 * @example
 * // role check
 * const { check, checkAny, checkAll } = useAuthCheck('role');
 * check('admin')
 * checkAny(['admin', 'editor'])
 * checkAll(['admin', 'editor'])
 */
export const useAuthCheck = (baseOn: "role" | "permission" = "permission") => {
	const isAuthenticated = useIsAuthenticated();
	const permissions = useUserPermissions() ?? [];
	const roles = useUserRoles() ?? [];

	// depends on baseOn to select resource pool
	const resourcePool = baseOn === "role" ? roles : permissions;

	// check if item exists
	const check = (item: string): boolean => {
		// if user is not logged in, return false
		if (!isAuthenticated) {
			return false;
		}
		return resourcePool.includes(item);
	};

	// check if any item exists
	const checkAny = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}
		return items.some((item) => check(item));
	};

	// check if all items exist
	const checkAll = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}
		return items.every((item) => check(item));
	};

	return { check, checkAny, checkAll };
};
