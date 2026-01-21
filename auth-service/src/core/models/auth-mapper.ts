import { AuthLoginDTO, AuthOtpDTO } from "./auth-dto";
import { AuthAccount } from "./auth-account";
import { AuthProvider, AuthCredential } from "../providers";
import type { PhoneAuthOtp } from "./phone-auth-otp";

/**
 * Mapper interface for converting DTOs to AuthAccount
 */
export interface AuthAccountMapper<T extends AuthAccount> {
	/**
	 * Convert login DTO to AuthAccount
	 */
	fromLogin(dto: AuthLoginDTO, provider: AuthProvider, credential: AuthCredential | null): T;
}

/**
 * Mapper interface for phone OTP
 */
export interface PhoneOtpMapper {
	/**
	 * Get phone auth OTP from request OTP DTO
	 */
	fromRequestOtp(dto: AuthOtpDTO, provider?: AuthProvider, credential?: AuthCredential): PhoneAuthOtp;
}
