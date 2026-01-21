import { AuthCredential } from "../providers";

/**
 * Base data transfer object for authentication
 */
export abstract class AuthDTO {
	constructor(
		public readonly credential: AuthCredential | null,
		public readonly data: any,
	) {}
}

/**
 * Data transfer object for login operations
 */
export class AuthLoginDTO extends AuthDTO {
	constructor(params: { credential?: AuthCredential | null; data: any }) {
		super(params.credential ?? null, params.data);
	}
}

/**
 * Data transfer object for OTP operations
 */
export class AuthOtpDTO extends AuthDTO {
	constructor(params: { credential?: AuthCredential | null; data: any }) {
		super(params.credential ?? null, params.data);
	}
}
