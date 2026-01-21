import type { AuthAccountMapper, AuthLoginDTO, AuthProvider, AuthCredential } from "auth-service";
import { AppAuthAccount } from "../models/app-auth-account";
import { AuthenticationStatus, AccountStatus, AuthAccountData, JWTToken, RefreshToken } from "auth-service";

/**
 * Mapper for converting AuthLoginDTO to AppAuthAccount
 */
export class AppAuthAccountMapper implements AuthAccountMapper<AppAuthAccount> {
	fromLogin(dto: AuthLoginDTO, provider: AuthProvider, credential: AuthCredential | null): AppAuthAccount {
		const data = dto.data;

		// Validate required fields
		if (!data.accessToken) {
			throw new Error("AccessToken is required in login response");
		}
		if (!data.refreshToken) {
			throw new Error("RefreshToken is required in login response");
		}
		if (!data.user) {
			throw new Error("User data is required in login response");
		}

		return new AppAuthAccount(
			AuthenticationStatus.Authenticated,
			AccountStatus.Registered,
			provider.providerId,
			credential?.identity ?? null,
			JWTToken.fromValue(data.accessToken),
			new RefreshToken(data.refreshToken),
			new AuthAccountData(data.user),
		);
	}
}
