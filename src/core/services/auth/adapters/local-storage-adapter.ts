import type { AuthLocalStoragePlatform } from "@auth-service";
import { JWTToken, RefreshToken, AuthenticationStatus, AccountStatus, AuthAccountData } from "@auth-service";
import { AppAuthAccount } from "../models/app-auth-account";
import { LocalStorageService } from "@/core/services/storages/local-storage";

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

		// Reconstruct AppAuthAccount instance
		return new AppAuthAccount(
			data.authStatus ?? AuthenticationStatus.Unauthenticated,
			data.accountStatus ?? AccountStatus.Unregistered,
			data.providerId ?? "",
			data.identity ?? null,
			accessToken,
			refreshToken,
			data.data ? new AuthAccountData(data.data.data) : null,
		);
	}

	async clearLocalAuthentication(): Promise<void> {
		LocalStorageService.remove(AuthLocalStorageAdapter.AUTH_KEY);
	}
}
