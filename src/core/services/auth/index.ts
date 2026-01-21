// Export all auth-related types and classes
export * from "./models/app-auth-account";
export * from "./adapters/local-storage-adapter";
export * from "./providers/email-auth-provider";
export * from "./providers/provider-manager";
export * from "./mappers/account-mapper";
export * from "./app-auth-service";
export * from "./hooks/use-auth";

// Export auth-service types for convenience
export type {
	AuthCredential,
	EmailAuthCredential,
	PhoneAuthCredential,
	AuthToken,
	AuthLoginDTO,
} from "@auth-service";

export {
	AuthenticationStatus,
	AccountStatus,
	EmailAuthCredential as EmailCredential,
	PhoneAuthCredential as PhoneCredential,
	UsernameAuthCredential,
	JWTToken,
	RefreshToken,
} from "@auth-service";
