import type { AuthAccount, AuthAccountMapper, AuthCredential, AuthLoginDTO, AuthProvider } from "@auth-service";
import { AccountStatus, AuthenticationStatus, createAuthAccount, JWTToken, RefreshToken } from "@auth-service";
import type { AppUserData } from "../models/app-auth-account";

/**
 * Expected structure of login response data
 */
export interface LoginResponseData {
	accessToken: string;
	refreshToken: string;
	user: AppUserData;
}

/**
 * Mapper for converting AuthLoginDTO to AppAuthAccount
 */
export class AppAuthAccountMapper
	implements AuthAccountMapper<AuthAccount<AppUserData>, AppUserData, LoginResponseData>
{
	fromLogin(
		dto: AuthLoginDTO<LoginResponseData>,
		provider?: AuthProvider<LoginResponseData>,
		credential?: AuthCredential | null,
	): AuthAccount<AppUserData> {
		const data = dto.data;

		return createAuthAccount<AppUserData>({
			authStatus: AuthenticationStatus.Authenticated,
			accountStatus: AccountStatus.Registered,
			providerId: provider?.providerId ?? null,
			identity: credential?.identity ?? null,
			accessToken: JWTToken.fromValue(data.accessToken),
			refreshToken: new RefreshToken(data.refreshToken),
			data: { data: data.user },
		});
	}
}
