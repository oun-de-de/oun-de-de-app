import type { AuthAccountMapper, AuthLoginDTO, AuthProvider, AuthCredential } from "auth-service";
import { AppAuthAccount } from "../models/app-auth-account";
import { AuthenticationStatus, AccountStatus, AuthAccountData, JWTToken, RefreshToken } from "auth-service";

/**
 * Mapper for converting AuthLoginDTO to AppAuthAccount
 */
export class AppAuthAccountMapper implements AuthAccountMapper<AppAuthAccount> {
	fromLogin(dto: AuthLoginDTO, provider: AuthProvider, credential: AuthCredential | null): AppAuthAccount {
		const data = dto.data;

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
