/**
 * Base interface for all authentication tokens
 */
export interface AuthToken {
	/** The type of the token (e.g., 'Bearer', 'Basic', 'JWT') */
	type: string;

	/** The raw token value */
	value: string;

	/** The formatted value to be used in Authorization header */
	authorizationValue: string;

	/** The expiration date of the token, null if no expiration */
	expiration: Date | null;

	/** Whether the token is currently valid (not expired) */
	isValid: boolean;
}

/**
 * JWT (JSON Web Token) implementation
 */
export class JWTToken implements AuthToken {
	public readonly type = "Bearer";

	constructor(
		public readonly value: string,
		public readonly expiration: Date | null = null,
	) {}

	get authorizationValue(): string {
		return `${this.type} ${this.value}`;
	}

	get isValid(): boolean {
		if (!this.value) return false;
		if (!this.expiration) return true;
		return this.expiration > new Date();
	}

	/**
	 * Decode JWT payload (without verification)
	 */
	decodePayload<T = any>(): T | null {
		try {
			const parts = this.value.split(".");
			if (parts.length !== 3) return null;

			const payload = parts[1];
			const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
			return decoded;
		} catch {
			return null;
		}
	}

	/**
	 * Create JWT token from value, auto-extract expiration from payload
	 */
	static fromValue(value: string): JWTToken {
		const tempToken = new JWTToken(value);
		const payload = tempToken.decodePayload<{ exp?: number }>();

		let expiration: Date | null = null;
		if (payload?.exp) {
			expiration = new Date(payload.exp * 1000);
		}

		return new JWTToken(value, expiration);
	}
}

/**
 * Basic authentication token implementation
 */
export class BasicAuthToken implements AuthToken {
	public readonly type = "Basic";

	constructor(
		public readonly value: string,
		public readonly expiration: Date | null = null,
	) {}

	get authorizationValue(): string {
		return `${this.type} ${this.value}`;
	}

	get isValid(): boolean {
		if (!this.value) return false;
		if (!this.expiration) return true;
		return this.expiration > new Date();
	}

	/**
	 * Create Basic Auth token from username and password
	 */
	static fromCredentials(username: string, password: string): BasicAuthToken {
		const credentials = `${username}:${password}`;
		const encoded = Buffer.from(credentials).toString("base64");
		return new BasicAuthToken(encoded);
	}
}

/**
 * Refresh token for obtaining new access tokens
 */
export class RefreshToken implements AuthToken {
	public readonly type = "Refresh";

	constructor(
		public readonly value: string,
		public readonly expiration: Date | null = null,
	) {}

	get authorizationValue(): string {
		return this.value;
	}

	get isValid(): boolean {
		if (!this.value) return false;
		if (!this.expiration) return true;
		return this.expiration > new Date();
	}
}
