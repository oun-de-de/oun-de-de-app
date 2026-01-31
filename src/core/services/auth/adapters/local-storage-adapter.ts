import type { AuthLocalStoragePlatform } from "@auth-service";
import { AccountStatus, AuthenticationStatus, JWTToken, RefreshToken } from "@auth-service";
import { LocalStorageService } from "@/core/services/storages/local-storage";
import type { AppAuthAccount, AppUserData } from "../models/app-auth-account";

/**
 * Local storage adapter for auth-service
 * Bridges auth-service with app's LocalStorageService
 */
export class AuthLocalStorageAdapter implements AuthLocalStoragePlatform<AppAuthAccount, AppUserData> {
	private static readonly AUTH_KEY = "auth_account";

	async saveLocalAuthentication(account: AppAuthAccount): Promise<void> {
		const serialized = {
			authStatus: account.authStatus,
			accountStatus: account.accountStatus,
			providerId: account.providerId,
			identity: account.identity,
			access_token: {
				type: account.access_token?.type,
				value: account.access_token?.value,
				expiration: account.access_token?.expiration,
			},
			refresh_token: {
				type: account.refresh_token?.type,
				value: account.refresh_token?.value,
				expiration: account.refresh_token?.expiration,
			},
			data: account.data,
		};

		LocalStorageService.save(AuthLocalStorageAdapter.AUTH_KEY, serialized);
	}

	async loadLocalAuthentication(): Promise<AppAuthAccount | null> {
		const data = LocalStorageService.loadOrNull<AppAuthAccount>(AuthLocalStorageAdapter.AUTH_KEY);
		debugger;
		if (!data) {
			return null;
		}

		// Reconstruct token instances from plain objects
		const access_token = data.access_token?.value ? JWTToken.fromValue(data.access_token.value) : null;

		const refresh_token = data.refresh_token?.value
			? new RefreshToken(
					data.refresh_token.value,
					data.refresh_token.expiration ? new Date(data.refresh_token.expiration) : null,
				)
			: null;

		// Return AppAuthAccount object
		return {
			authStatus: data.authStatus ?? AuthenticationStatus.Unauthenticated,
			accountStatus: data.accountStatus ?? AccountStatus.Unregistered,
			providerId: data.providerId ?? "",
			identity: data.identity ?? null,
			access_token: access_token,
			refresh_token: refresh_token,
			data: data.data,
			isAuthenticated: data.authStatus === AuthenticationStatus.Authenticated,
			hasValidAccessToken: access_token?.isValid ?? false,
			hasValidRefreshToken: refresh_token?.isValid ?? false,
		};
	}

	async clearLocalAuthentication(): Promise<void> {
		LocalStorageService.remove(AuthLocalStorageAdapter.AUTH_KEY);
	}
}
