import { AuthToken, RefreshToken } from "../tokens";

/**
 * Authentication status enumeration
 */
export enum AuthenticationStatus {
	Authenticated = "authenticated",
	Unauthenticated = "unauthenticated",
}

/**
 * Account status enumeration
 */
export enum AccountStatus {
	Registered = "registered",
	Guest = "guest",
	Unregistered = "unregistered",
}

/**
 * Data associated with an authentication account
 */
export class AuthAccountData {
	constructor(public readonly data: any) {}
}

/**
 * Authentication account model
 */
export class AuthAccount {
	constructor(
		public readonly authStatus: AuthenticationStatus,
		public readonly accountStatus: AccountStatus | null = null,
		public readonly providerId: string | null = null,
		public readonly identity: string | null = null,
		public readonly accessToken: AuthToken | null = null,
		public readonly refreshToken: RefreshToken | null = null,
		public readonly data: AuthAccountData | null = null,
	) {}

	/**
	 * Create an unauthenticated account
	 */
	static unauthenticated(): AuthAccount {
		return new AuthAccount(AuthenticationStatus.Unauthenticated);
	}

	/**
	 * Copy with changes
	 */
	copyWith(changes: {
		authStatus?: AuthenticationStatus;
		accountStatus?: AccountStatus | null;
		providerId?: string | null;
		identity?: string | null;
		accessToken?: AuthToken | null;
		refreshToken?: RefreshToken | null;
		data?: AuthAccountData | null;
	}): AuthAccount {
		return new AuthAccount(
			changes.authStatus ?? this.authStatus,
			changes.accountStatus ?? this.accountStatus,
			changes.providerId ?? this.providerId,
			changes.identity ?? this.identity,
			changes.accessToken ?? this.accessToken,
			changes.refreshToken ?? this.refreshToken,
			changes.data ?? this.data,
		);
	}

	/**
	 * Check if account is authenticated
	 */
	get isAuthenticated(): boolean {
		return this.authStatus === AuthenticationStatus.Authenticated;
	}

	/**
	 * Check if access token is valid
	 */
	get hasValidAccessToken(): boolean {
		return this.accessToken?.isValid ?? false;
	}

	/**
	 * Check if refresh token is valid
	 */
	get hasValidRefreshToken(): boolean {
		return this.refreshToken?.isValid ?? false;
	}
}
