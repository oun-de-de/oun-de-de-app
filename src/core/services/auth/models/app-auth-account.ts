import { AuthAccount } from "@auth-service";
import type { UserInfo } from "@/core/types/entity";

/**
 * Application-specific user data
 */
export interface AppUserData {
	id: string;
	username: string;
	email: string;
	phoneNumber?: string;
	avatar?: string;
	roles: string[];
	permissions: string[];
	// Include UserInfo fields
	status?: UserInfo["status"];
}

export class AppAuthAccount extends AuthAccount {
	private get userData(): AppUserData | undefined {
		return this.data?.data as AppUserData | undefined;
	}
	/**
	 * Get user ID
	 */
	get userId(): string {
		return this.userData?.id ?? "";
	}

	/**
	 * Get username
	 */
	get username(): string {
		return this.userData?.username ?? "";
	}

	/**
	 * Get email
	 */
	get email(): string | undefined {
		return this.userData?.email;
	}

	/**
	 * Get phone number
	 */
	get phoneNumber(): string | undefined {
		return this.userData?.phoneNumber;
	}

	/**
	 * Get avatar URL
	 */
	get avatar(): string | undefined {
		return this.userData?.avatar;
	}

	/**
	 * Get user roles
	 */
	get roles(): string[] {
		return this.userData?.roles ?? [];
	}

	/**
	 * Get user permissions
	 */
	get permissions(): string[] {
		return this.userData?.permissions ?? [];
	}

	/**
	 * Check if user has specific role
	 */
	hasRole(role: string): boolean {
		return this.roles.includes(role);
	}

	/**
	 * Check if user has specific permission
	 */
	hasPermission(permission: string): boolean {
		return this.permissions.includes(permission);
	}

	/**
	 * Check if user has any of the specified roles
	 */
	hasAnyRole(roles: string[]): boolean {
		return roles.some((role) => this.hasRole(role));
	}

	/**
	 * Check if user has any of the specified permissions
	 */
	hasAnyPermission(permissions: string[]): boolean {
		return permissions.some((permission) => this.hasPermission(permission));
	}
}
