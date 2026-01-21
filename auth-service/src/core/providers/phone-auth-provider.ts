import { AuthCredential, AuthProvider } from "./auth-provider";
import { AuthLoginDTO, AuthOtpDTO } from "../models";
import { AuthToken } from "../tokens";

/**
 * Phone authentication credential
 */
export class PhoneAuthCredential extends AuthCredential {
	constructor(
		providerId: string,
		public readonly phoneNumber: string,
		public otp: string | null = null,
		public sessionId: string | null = null,
	) {
		super(providerId);
	}

	get identity(): string {
		return this.phoneNumber;
	}

	copyWith(changes?: { phoneNumber?: string; otp?: string | null; sessionId?: string | null }): PhoneAuthCredential {
		return new PhoneAuthCredential(
			this.providerId,
			changes?.phoneNumber ?? this.phoneNumber,
			changes?.otp ?? this.otp,
			changes?.sessionId ?? this.sessionId,
		);
	}

	toMap(): Record<string, any> {
		return {
			phoneNumber: this.phoneNumber,
			otp: this.otp,
			sessionId: this.sessionId,
		};
	}
}

/**
 * Phone authentication provider
 */
export abstract class PhoneAuthProvider extends AuthProvider {
	constructor(config: { providerId: string }) {
		super(config.providerId);
	}

	abstract login(credential: PhoneAuthCredential): Promise<AuthLoginDTO>;

	abstract loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO>;

	/**
	 * Request OTP for phone number
	 */
	abstract requestOtp(credential: PhoneAuthCredential): Promise<AuthOtpDTO>;

	/**
	 * Verify OTP code
	 */
	abstract verifyOtp(credential: PhoneAuthCredential): Promise<AuthLoginDTO>;
}
