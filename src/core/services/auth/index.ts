// Export all auth-related types and classes

// Export auth-service types for convenience
export type {
	AuthCredential,
	AuthLoginDTO,
	AuthToken,
	EmailAuthCredential,
	PhoneAuthCredential,
} from "@auth-service";

export {
	AccountStatus,
	AuthenticationStatus,
	EmailAuthCredential as EmailCredential,
	JWTToken,
	PhoneAuthCredential as PhoneCredential,
	RefreshToken,
	UsernameAuthCredential,
} from "@auth-service";

export { AppAuthService } from "./app-auth-service";
