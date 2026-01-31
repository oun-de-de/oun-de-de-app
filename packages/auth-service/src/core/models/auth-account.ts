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
 * Authentication account model
 */
export type AuthAccount<T> = {
	authStatus: AuthenticationStatus;
	accountStatus: AccountStatus | null;
	providerId: string | null;
	identity: string | null;
	access_token: AuthToken | null;
	refresh_token: RefreshToken | null;
	data: T | null;
	isAuthenticated: boolean;
	hasValidAccessToken: boolean;
	hasValidRefreshToken: boolean;
};

/**
 * Create an unauthenticated account
 */
export function createUnauthenticatedAccount<T>(): AuthAccount<T> {
	return {
		authStatus: AuthenticationStatus.Unauthenticated,
		accountStatus: null,
		providerId: null,
		identity: null,
		access_token: null,
		refresh_token: null,
		data: null,
		isAuthenticated: false,
		hasValidAccessToken: false,
		hasValidRefreshToken: false,
	};
}

/**
 * Create an authenticated account
 */
export function createAuthAccount<T>(params: {
	authStatus: AuthenticationStatus;
	accountStatus?: AccountStatus | null;
	providerId?: string | null;
	identity?: string | null;
	access_token?: AuthToken | null;
	refresh_token?: RefreshToken | null;
	data?: T | null;
}): AuthAccount<T> {
	const hasValidAccessToken = params.access_token?.isValid ?? false;
	const hasValidRefreshToken = params.refresh_token?.isValid ?? false;
	const isAuthenticated = params.authStatus === AuthenticationStatus.Authenticated;

	return {
		authStatus: params.authStatus,
		accountStatus: params.accountStatus ?? null,
		providerId: params.providerId ?? null,
		identity: params.identity ?? null,
		access_token: params.access_token ?? null,
		refresh_token: params.refresh_token ?? null,
		data: params.data ?? null,
		isAuthenticated,
		hasValidAccessToken,
		hasValidRefreshToken,
	};
}

/**
 * Copy account with changes
 */
export function copyAuthAccount<T>(
	account: AuthAccount<T>,
	changes: Partial<Omit<AuthAccount<T>, "isAuthenticated" | "hasValidAccessToken" | "hasValidRefreshToken">>,
): AuthAccount<T> {
	const updated = {
		authStatus: changes.authStatus ?? account.authStatus,
		accountStatus: changes.accountStatus !== undefined ? changes.accountStatus : account.accountStatus,
		providerId: changes.providerId !== undefined ? changes.providerId : account.providerId,
		identity: changes.identity !== undefined ? changes.identity : account.identity,
		accessToken: changes.access_token !== undefined ? changes.access_token : account.access_token,
		refreshToken: changes.refresh_token !== undefined ? changes.refresh_token : account.refresh_token,
		data: changes.data !== undefined ? changes.data : account.data,
	};

	return createAuthAccount(updated);
}
