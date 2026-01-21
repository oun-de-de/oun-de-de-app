import { AuthLoginDTO } from "../models";
import { AuthToken } from "../tokens";

/**
 * Base authentication credential
 */
export abstract class AuthCredential {
	constructor(public readonly providerId: string) {}

	/**
	 * The identity of the credential (email, phone, username, etc.)
	 */
	abstract get identity(): string | null;

	/**
	 * Create a copy of this credential
	 */
	abstract copyWith(changes?: any): AuthCredential;

	/**
	 * Convert credential to map for API requests
	 */
	abstract toMap(): Record<string, any>;
}

/**
 * Base authentication provider
 * Handles the authentication process only
 */
export abstract class AuthProvider {
	constructor(public readonly providerId: string) {}

	/**
	 * Authenticate user with credentials
	 */
	abstract login(credential: AuthCredential): Promise<AuthLoginDTO>;

	/**
	 * Authenticate user with an auth token
	 */
	abstract loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO>;

	toString(): string {
		return `AuthProvider(providerId: ${this.providerId})`;
	}
}
