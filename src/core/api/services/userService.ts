import { AppAuthService } from "@/core/services/auth/app-auth-service";
import type { AppAuthAccount } from "@/core/services/auth/models/app-auth-account";
import { apiClient, noAuthApi } from "../apiClient";

export interface SignInReq {
	username: string;
	password: string;
}

export interface SignUpReq extends SignInReq {
	email: string;
}

export interface TokenRefreshRequest {
	refreshToken: string;
}

export enum UserApi {
	SignIn = "/auth/sign-in",
	SignUp = "/auth/sign-up",
	Logout = "/auth/sign-out",
	Refresh = "/auth/token/refresh",
}

class UserService {
	async signin(data: SignInReq) {
		const response = await noAuthApi.post<AppAuthAccount>({
			url: UserApi.SignIn,
			data,
		});
		return response;
	}

	async signup(data: SignUpReq) {
		const response = await noAuthApi.post<AppAuthAccount>({
			url: UserApi.SignUp,
			data,
		});
		return response;
	}

	async logout() {
		const refreshToken = AppAuthService.getInstance().getRefreshToken();
		if (!refreshToken) return null;

		const response = await apiClient.post<string>({
			url: UserApi.Logout,
			data: { refreshToken } satisfies TokenRefreshRequest,
		});
		return response;
	}
}

export default new UserService();
