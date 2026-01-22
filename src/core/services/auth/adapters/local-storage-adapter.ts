import type { AuthLocalStoragePlatform } from "@auth-service";
import { AccountStatus, AuthenticationStatus, JWTToken, RefreshToken } from "@auth-service";
import { LocalStorageService } from "@/core/services/storages/local-storage";
import type { AppAuthAccount, AppUserData } from "../models/app-auth-account";

/**
 * Local storage adapter for auth-service
 * Bridges auth-service with app's LocalStorageService
 */
export class AuthLocalStorageAdapter implements AuthLocalStoragePlatform<AppAuthAccount> {
	private static readonly AUTH_KEY = "auth_account";

	async saveLocalAuthentication(account: AppAuthAccount): Promise<void> {
		const serialized = {
			authStatus: account.authStatus,
			accountStatus: account.accountStatus,
			providerId: account.providerId,
			identity: account.identity,
			accessToken: {
				type: account.accessToken?.type,
				value: account.accessToken?.value,
				expiration: account.accessToken?.expiration,
			},
			refreshToken: {
				type: account.refreshToken?.type,
				value: account.refreshToken?.value,
				expiration: account.refreshToken?.expiration,
			},
			data: account.data,
		};

		LocalStorageService.save(AuthLocalStorageAdapter.AUTH_KEY, serialized);
	}

	async loadLocalAuthentication(): Promise<AppAuthAccount | null> {
		const data = LocalStorageService.loadOrNull<any>(AuthLocalStorageAdapter.AUTH_KEY);

		if (!data) {
			return null;
		}

		// Reconstruct token instances from plain objects
		const accessToken = data.accessToken?.value ? JWTToken.fromValue(data.accessToken.value) : null;

		const refreshToken = data.refreshToken?.value
			? new RefreshToken(
					data.refreshToken.value,
					data.refreshToken.expiration ? new Date(data.refreshToken.expiration) : null,
				)
			: null;

		// Return AppAuthAccount object
		return {
			authStatus: data.authStatus ?? AuthenticationStatus.Unauthenticated,
			accountStatus: data.accountStatus ?? AccountStatus.Unregistered,
			providerId: data.providerId ?? "",
			identity: data.identity ?? null,
			accessToken,
			refreshToken,
			data: data.data ? { data: data.data.data as AppUserData } : null,
			isAuthenticated: data.authStatus === AuthenticationStatus.Authenticated,
			hasValidAccessToken: accessToken?.isValid ?? false,
			hasValidRefreshToken: refreshToken?.isValid ?? false,
		};
	}

	async clearLocalAuthentication(): Promise<void> {
		LocalStorageService.remove(AuthLocalStorageAdapter.AUTH_KEY);
	}
}
