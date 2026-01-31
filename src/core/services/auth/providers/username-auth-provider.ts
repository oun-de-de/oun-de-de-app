import { type AuthLoginDTO, type AuthToken, type UsernameAuthCredential, UsernameAuthProvider } from "@auth-service";
import { createTaggedLogger } from "@/core/utils/logger";
import { AppAuthAccount } from "../models/app-auth-account";
import { UserApi } from "@/core/api/services/userService";
import { apiClient, noAuthApi } from "@/core/api/apiClient";

const logger = createTaggedLogger("UsernameAuthProvider");

/**
 * Username/password authentication provider for the application
 */
export class AppUsernameAuthProvider implements UsernameAuthProvider<AppAuthAccount> {
	readonly providerId = "username";

	async login(credential: UsernameAuthCredential): Promise<AuthLoginDTO<AppAuthAccount>> {
		// Call API to authenticate (no auth token required)
		const response = await noAuthApi.post<AppAuthAccount>({
			url: UserApi.SignIn,
			data: {
				username: credential.username,
				password: credential.password,
			},
		});

		if (!response) {
			throw new Error("Empty response from sign in API");
		}

		// Transform API response to AuthLoginDTO
		logger.debug("login response", response);
		return {
			data: response,
			credential: null,
		};
	}

	async loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO<AppAuthAccount>> {
		// Use refresh token to get new access token (no auth header)
		const response = await noAuthApi.post<AppAuthAccount>({
			url: UserApi.Refresh,
			data: { refreshToken: token.value },
		});

		if (!response) {
			throw new Error("Empty response from refresh API");
		}

		// logger.debug("loginWithAuthToken response", response);
		return {
			data: response,
			credential: null,
		};
	}

	async logout(): Promise<void> {
		try {
			// Logout requires auth token
			await apiClient.get({
				url: UserApi.Logout,
			});
		} catch (error) {
			// Ignore logout errors
			logger.warn("Logout API call failed:", error);
		}
	}

	async refreshToken(refreshToken: string): Promise<AuthLoginDTO<AppAuthAccount>> {
		const response = await noAuthApi.post<AppAuthAccount>({
			url: UserApi.Refresh,
			data: { refreshToken },
		});

		if (!response) {
			throw new Error("Empty response from refresh API");
		}

		return {
			data: response,
			credential: null,
		};
	}
}
