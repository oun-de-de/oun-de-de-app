import { AuthService } from "@auth-service";
import type { AuthProviderManagerPlatform, AuthLocalStoragePlatform, AuthAccountMapper } from "@auth-service";
import { AppAuthAccount } from "./models/app-auth-account";
import { AppAuthProviderManager } from "./providers/provider-manager";
import { AppAuthAccountMapper } from "./mappers/account-mapper";
import { AuthLocalStorageAdapter } from "./adapters/local-storage-adapter";

/**
 * Application authentication service
 * Singleton instance managing all authentication flows
 */
export class AppAuthService extends AuthService<AppAuthAccount> {
	private static _instance: AppAuthService | null = null;

	private _providerManager: AuthProviderManagerPlatform;
	private _localStorage: AuthLocalStoragePlatform<AppAuthAccount>;
	private _accountMapper: AuthAccountMapper<AppAuthAccount>;

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

	protected get providerManager(): AuthProviderManagerPlatform {
		return this._providerManager;
	}

	protected get localStorage(): AuthLocalStoragePlatform<AppAuthAccount> {
		return this._localStorage;
	}

	protected get accountMapper(): AuthAccountMapper<AppAuthAccount> {
		return this._accountMapper;
	}

	/**
	 * Get access token for API requests
	 */
	getAccessToken(): string | null {
		return this.getCurrentUser()?.accessToken?.value ?? null;
	}

	/**
	 * Get refresh token
	 */
	getRefreshToken(): string | null {
		return this.getCurrentUser()?.refreshToken?.value ?? null;
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
	getUserInfo() {
		return this.getCurrentUser()?.data?.data ?? null;
	}
}
