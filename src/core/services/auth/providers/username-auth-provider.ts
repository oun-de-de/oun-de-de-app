import { type AuthLoginDTO, type AuthToken, type UsernameAuthCredential, UsernameAuthProvider } from "@auth-service";
import { type SignInRes, UserApi } from "@/core/api/services/userService";
import { createTaggedLogger } from "@/core/utils/logger";
import { MainApi } from "@/core/api";

const logger = createTaggedLogger("UsernameAuthProvider");

/**
 * Login response data structure
 */
interface LoginResponseData {
	accessToken: string;
	refreshToken: string;
	user: any;
}

/**
 * Username/password authentication provider for the application
 */
export class AppUsernameAuthProvider extends MainApi implements UsernameAuthProvider<LoginResponseData> {
	readonly providerId = "username";

	async login(credential: UsernameAuthCredential): Promise<AuthLoginDTO<LoginResponseData>> {
		// Call API to authenticate (no auth token required)
		const { body: response } = await this.noAuthClient.post<SignInRes>(UserApi.SignIn, {
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
			data: {
				accessToken: response.accessToken!,
				refreshToken: response.refreshToken!,
				user: response.user,
			},
			credential: null,
		};
	}

	async loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO<LoginResponseData>> {
		// Use refresh token to get new access token (no auth header)
		const { body: response } = await this.noAuthClient.post<SignInRes>(UserApi.Refresh, {
			data: { refreshToken: token.value },
		});

		if (!response) {
			throw new Error("Empty response from refresh API");
		}

		logger.debug("loginWithAuthToken response", response);
		return {
			data: {
				accessToken: response.accessToken!,
				refreshToken: response.refreshToken!,
				user: response.user,
			},
			credential: null,
		};
	}

	async logout(): Promise<void> {
		try {
			// Logout requires auth token
			await this.client.get(UserApi.Logout);
		} catch (error) {
			// Ignore logout errors
			logger.warn("Logout API call failed:", error);
		}
	}

	async refreshToken(refreshToken: string): Promise<AuthLoginDTO<LoginResponseData>> {
		const { body: response } = await this.noAuthClient.post<SignInRes>(UserApi.Refresh, {
			data: { refreshToken },
		});

		if (!response) {
			throw new Error("Empty response from refresh API");
		}

		return {
			data: {
				accessToken: response.accessToken!,
				refreshToken: response.refreshToken!,
				user: response.user,
			},
			credential: null,
		};
	}
}
