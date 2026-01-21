/**
 * Custom exception for authentication errors
 */
export class AuthException extends Error {
	constructor(
		message: string,
		public code: string,
		public details?: any,
	) {
		super(message);
		this.name = "AuthException";
		Object.setPrototypeOf(this, AuthException.prototype);
	}
}

/**
 * Exception thrown when provider is not found
 */
export class UnsupportedAuthProviderException extends AuthException {
	constructor(providerId: string) {
		super(`Auth provider '${providerId}' is not supported or not registered`, "UNSUPPORTED_PROVIDER", { providerId });
		this.name = "UnsupportedAuthProviderException";
	}
}

/**
 * Exception thrown when no provider is available
 */
export class EmptyAuthProviderException extends AuthException {
	constructor() {
		super("No auth provider is available. Please register at least one provider.", "EMPTY_PROVIDER");
		this.name = "EmptyAuthProviderException";
	}
}

/**
 * Exception thrown when authentication value is invalid
 */
export class UnsupportedValueForAuthenticateException extends AuthException {
	constructor(value: any) {
		super(
			`The value type '${typeof value}' is not supported for authentication. Expected AuthCredential or AuthToken.`,
			"UNSUPPORTED_VALUE",
			{ value },
		);
		this.name = "UnsupportedValueForAuthenticateException";
	}
}

/**
 * Exception thrown when token is invalid or expired
 */
export class InvalidTokenException extends AuthException {
	constructor(message: string = "Token is invalid or expired") {
		super(message, "INVALID_TOKEN");
		this.name = "InvalidTokenException";
	}
}

/**
 * Exception thrown when authentication fails
 */
export class AuthenticationFailedException extends AuthException {
	constructor(message: string = "Authentication failed", details?: any) {
		super(message, "AUTHENTICATION_FAILED", details);
		this.name = "AuthenticationFailedException";
	}
}

/**
 * Exception thrown when refresh token fails
 */
export class RefreshTokenFailedException extends AuthException {
	constructor(message: string = "Failed to refresh access token") {
		super(message, "REFRESH_TOKEN_FAILED");
		this.name = "RefreshTokenFailedException";
	}
}
