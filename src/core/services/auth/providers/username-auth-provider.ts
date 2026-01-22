import { type AuthLoginDTO, type AuthToken, type UsernameAuthCredential, UsernameAuthProvider } from "@auth-service";
import apiClient from "@/core/api/apiClient";
import { type SignInRes, UserApi } from "@/core/api/services/userService";
import { createTaggedLogger } from "@/core/utils/logger";

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
export class AppUsernameAuthProvider extends UsernameAuthProvider<LoginResponseData> {
	constructor() {
		super({ providerId: "username" });
	}

	async login(credential: UsernameAuthCredential): Promise<AuthLoginDTO<LoginResponseData>> {
		// Call API to authenticate
		const response = await apiClient.post<SignInRes>({
			url: UserApi.SignIn,
			data: {
				username: credential.username,
				password: credential.password,
			},
		});

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
		// Use refresh token to get new access token
		const response = await apiClient.post<SignInRes>({
			url: UserApi.Refresh,
			data: { refreshToken: token.value },
		});

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
			await apiClient.get({ url: UserApi.Logout });
		} catch (error) {
			// Ignore logout errors
			logger.warn("Logout API call failed:", error);
		}
	}

	async refreshToken(refreshToken: string): Promise<AuthLoginDTO<LoginResponseData>> {
		const response = await apiClient.post<SignInRes>({
			url: UserApi.Refresh,
			data: { refreshToken },
		});

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
