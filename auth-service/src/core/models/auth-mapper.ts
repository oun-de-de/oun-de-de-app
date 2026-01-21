import { AuthLoginDTO } from "./auth-dto";
import { AuthAccount } from "./auth-account";
import { AuthProvider, AuthCredential } from "../providers";

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
export interface PhoneOtpMapper<T = any> {
	/**
	 * Convert OTP DTO to custom type
	 */
	fromDTO(dto: any): T;

	/**
	 * Convert custom type to DTO
	 */
	toDTO(data: T): any;
}
