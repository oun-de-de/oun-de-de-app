import type {
	AuthAccount,
	AuthAccountMapper,
	AuthCredential,
	AuthLoginDTO,
	AuthProvider,
	AuthToken,
} from "@auth-service";
import { AccountStatus, AuthenticationStatus, createAuthAccount, JWTToken, RefreshToken } from "@auth-service";
import type { AppAuthAccount, AppUserData } from "../models/app-auth-account";

export interface LoginResponseDTO {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	type: string;

	user_id: string;
	username: string;
	roles: string[] | null;
}

/**
 * Mapper for converting AuthLoginDTO to AppAuthAccount
 */
export class AppAuthAccountMapper implements AuthAccountMapper<AppAuthAccount, AppUserData> {
	fromLogin(
		dto: AuthLoginDTO<AppAuthAccount>,
		provider?: AuthProvider<AppAuthAccount>,
		credential?: AuthCredential | null,
	): AuthAccount<AppUserData> {
		const raw = dto.data as object as LoginResponseDTO;

		// 1. Tokens
		const accessToken = normalizeAuthToken(raw.access_token, raw.expires_in, raw?.type);

		const refreshToken = normalizeAuthToken(raw.refresh_token, raw.expires_in, raw?.type);

		// 2. User mapping
		const user: AppUserData = {
			user_id: raw.user_id,
			username: raw.username,
			type: raw.type,
			roles: Array.isArray(raw.roles) ? raw.roles : [],
			permissions: [],
		};

		return createAuthAccount<AppUserData>({
			authStatus: AuthenticationStatus.Authenticated,
			accountStatus: AccountStatus.Registered,
			providerId: provider?.providerId ?? null,
			identity: credential?.identity ?? null,
			access_token: JWTToken.fromValue(accessToken.value),
			refresh_token: new RefreshToken(refreshToken.value, refreshToken.expiration),
			data: user,
		});
	}
}

function normalizeAuthToken(raw: unknown, expiration: number | null, typeFallback: string = "Bearer"): AuthToken {
	if (typeof raw === "string") {
		return {
			value: raw,
			type: typeFallback,
			authorizationValue: raw,
			expiration: expiration ? new Date(Date.now() + expiration * 1000) : null,
			isValid: true,
		};
	}

	if (raw && typeof raw === "object") {
		const token = raw as {
			value?: string;
			type?: string;
			expiration?: string | Date | null;
		};

		const value = token.value ?? "";
		const type = token.type ?? typeFallback;
		const expiration = token.expiration ? new Date(token.expiration) : null;

		return {
			value,
			type,
			authorizationValue: value,
			expiration,
			isValid: expiration ? expiration.getTime() > Date.now() : true,
		};
	}

	return {
		value: "",
		type: typeFallback,
		authorizationValue: "",
		expiration: null,
		isValid: false,
	};
}
