import { UsernameAuthCredential, UsernameAuthProvider, type AuthLoginDTO, type AuthToken } from "auth-service";
import apiClient from "@/core/api/apiClient";
import { UserApi, type SignInRes } from "@/core/api/services/userService";

/**
 * Username/password authentication provider for the application
 */
export class AppUsernameAuthProvider extends UsernameAuthProvider {
	constructor() {
		super({ providerId: "username" });
	}

	async login(credential: UsernameAuthCredential): Promise<AuthLoginDTO> {
		// Call API to authenticate
		const response = await apiClient.post<SignInRes>({
			url: UserApi.SignIn,
			data: {
				username: credential.username,
				password: credential.password,
			},
		});

		// Transform API response to AuthLoginDTO
		return {
			data: {
				accessToken: response.accessToken,
				refreshToken: response.refreshToken,
				user: response.user,
			},
			credential: null,
		};
	}

	async loginWithAuthToken(_token: AuthToken): Promise<AuthLoginDTO> {
		// Not implemented yet
		throw new Error("loginWithAuthToken not implemented");
	}

	async logout(): Promise<void> {
		try {
			await apiClient.get({ url: UserApi.Logout });
		} catch (error) {
			// Ignore logout errors
			console.warn("Logout API call failed:", error);
		}
	}

	async refreshToken(refreshToken: string): Promise<AuthLoginDTO> {
		const response = await apiClient.post<SignInRes>({
			url: UserApi.Refresh,
			data: { refreshToken },
		});

		return {
			data: {
				accessToken: response.accessToken,
				refreshToken: response.refreshToken,
				user: response.user,
			},
			credential: null,
		};
	}
}
