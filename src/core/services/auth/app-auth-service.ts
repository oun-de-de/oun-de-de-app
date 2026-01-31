import type { AuthAccountMapper, AuthLocalStoragePlatform, AuthProviderManagerPlatform } from "@auth-service";
import { AuthService } from "@auth-service";
import { AuthLocalStorageAdapter } from "./adapters/local-storage-adapter";
import { AppAuthAccountMapper } from "./mappers/account-mapper";
import type { AppAuthAccount, AppUserData } from "./models/app-auth-account";
import { AppAuthAccountHelpers } from "./models/app-auth-account";
import { AppAuthProviderManager } from "./providers/provider-manager";

/**
 * Application authentication service
 * Singleton instance managing all authentication flows
 */
export class AppAuthService extends AuthService<AppAuthAccount, AppUserData> {
	private static _instance: AppAuthService | null = null;

	private _providerManager: AuthProviderManagerPlatform<AppAuthAccount>;
	private _localStorage: AuthLocalStoragePlatform<AppAuthAccount, AppUserData>;
	private _accountMapper: AuthAccountMapper<AppAuthAccount, AppUserData>;

	private constructor() {
		super();
		this._providerManager = new AppAuthProviderManager();
		this._localStorage = new AuthLocalStorageAdapter();
		this._accountMapper = new AppAuthAccountMapper();
	}

	/**
	 * Get singleton instance
	 */
	static getInstance(): AppAuthService {
		if (!AppAuthService._instance) {
			AppAuthService._instance = new AppAuthService();
		}
		return AppAuthService._instance;
	}

	/**
	 * Reset singleton instance (for testing)
	 */
	static resetInstance(): void {
		AppAuthService._instance = null;
	}

	protected get providerManager(): AuthProviderManagerPlatform<AppAuthAccount> {
		return this._providerManager;
	}

	protected get localStorage(): AuthLocalStoragePlatform<AppAuthAccount, AppUserData> {
		return this._localStorage;
	}

	protected get accountMapper(): AuthAccountMapper<AppAuthAccount, AppUserData> {
		return this._accountMapper;
	}

	/**
	 * Get access token for API requests
	 */
	getAccessToken(): string | null {
		return this.getCurrentUser()?.access_token?.value ?? null;
	}

	/**
	 * Get refresh token
	 */
	getRefreshToken(): string | null {
		return this.getCurrentUser()?.refresh_token?.value ?? null;
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return this.getCurrentUser()?.isAuthenticated ?? false;
	}

	/**
	 * Get current user info
	 */
	getUserInfo(): AppUserData | null {
		return this.getCurrentUser()?.data ?? null;
	}

	/**
	 * Get user ID
	 */
	getUserId(): string {
		const user = this.getCurrentUser();
		return user ? AppAuthAccountHelpers.getUserId(user) : "";
	}

	/**
	 * Get username
	 */
	getUsername(): string {
		const user = this.getCurrentUser();
		return user ? AppAuthAccountHelpers.getUsername(user) : "";
	}

	/**
	 * Check if user has specific role
	 */
	hasRole(role: string): boolean {
		const user = this.getCurrentUser();
		return user ? AppAuthAccountHelpers.hasRole(user, role) : false;
	}

	/**
	 * Check if user has specific permission
	 */
	hasPermission(permission: string): boolean {
		const user = this.getCurrentUser();
		return user ? AppAuthAccountHelpers.hasPermission(user, permission) : false;
	}
}
