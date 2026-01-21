import { AuthAccount } from "../models";

/**
 * Local storage interface for authentication
 */
export interface AuthLocalStoragePlatform<T extends AuthAccount> {
	/**
	 * Save authentication to local/secure storage
	 */
	saveLocalAuthentication(account: T): Promise<void>;

	/**
	 * Clear authentication from local/secure storage
	 */
	clearLocalAuthentication(): Promise<void>;

	/**
	 * Load authentication from local/secure storage
	 */
	loadLocalAuthentication(): Promise<T | null>;
}
