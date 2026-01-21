import type { PhoneAuthProvider, PhoneAuthCredential } from "../providers";

/**
 * Phone authentication OTP model
 */
export class PhoneAuthOtp {
	constructor(
		public readonly provider: PhoneAuthProvider | null = null,
		public readonly credential: PhoneAuthCredential | null = null,
		public readonly otp: string | null = null,
		public readonly sendDate: Date | null = null,
		public readonly expirationOtp: Date | null = null,
	) {}

	/**
	 * Check if OTP is expired
	 */
	get isExpired(): boolean {
		if (!this.expirationOtp) return false;
		return this.expirationOtp < new Date();
	}

	/**
	 * Check if OTP is valid
	 */
	get isValid(): boolean {
		return !!this.otp && !this.isExpired;
	}

	/**
	 * Copy with changes
	 */
	copyWith(changes: {
		provider?: PhoneAuthProvider | null;
		credential?: PhoneAuthCredential | null;
		otp?: string | null;
		sendDate?: Date | null;
		expirationOtp?: Date | null;
	}): PhoneAuthOtp {
		return new PhoneAuthOtp(
			changes.provider ?? this.provider,
			changes.credential ?? this.credential,
			changes.otp ?? this.otp,
			changes.sendDate ?? this.sendDate,
			changes.expirationOtp ?? this.expirationOtp,
		);
	}
}
