import type { AuthAccount, AuthCredential } from "@auth-service";

/**
 * Events emitted by AuthRepository
 */
export enum AuthRepositoryEvent {
	Login = "login",
	Logout = "logout",
	ChangePassword = "changePassword",
}

/**
 * Authentication repository interface
 * Handles authentication operations and business logic
 */
export interface AuthRepository {
	/**
	 * Get the number of times user has logged out
	 */
	get logoutCount(): number;

	/**
	 * Login with credentials
	 */
	login(credential: AuthCredential): Promise<AuthAccount | null>;

	/**
	 * Logout current user
	 */
	logout(): Promise<void>;

	/**
	 * Change user password
	 */
	changePassword(oldPassword: string, newPassword: string): Promise<void>;
}
