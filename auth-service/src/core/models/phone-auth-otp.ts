/**
 * Phone authentication OTP model
 */
export class PhoneAuthOtp {
	constructor(
		public readonly phoneNumber: string,
		public readonly otp: string | null = null,
		public readonly sessionId: string | null = null,
		public readonly expiresAt: Date | null = null,
		public readonly data: any = null,
	) {}

	/**
	 * Check if OTP is expired
	 */
	get isExpired(): boolean {
		if (!this.expiresAt) return false;
		return this.expiresAt < new Date();
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
		phoneNumber?: string;
		otp?: string | null;
		sessionId?: string | null;
		expiresAt?: Date | null;
		data?: any;
	}): PhoneAuthOtp {
		return new PhoneAuthOtp(
			changes.phoneNumber ?? this.phoneNumber,
			changes.otp ?? this.otp,
			changes.sessionId ?? this.sessionId,
			changes.expiresAt ?? this.expiresAt,
			changes.data ?? this.data,
		);
	}
}
