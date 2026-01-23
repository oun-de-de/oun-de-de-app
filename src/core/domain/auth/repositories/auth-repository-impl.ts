import type { AuthAccount, AuthCredential } from "@auth-service";
import passwordService from "@/core/api/services/passwordService";
import type { AppAuthService } from "@/core/services/auth";
import type { AuthRepository } from "./auth-repository";

/**
 * Authentication repository implementation
 * Implements business logic for authentication operations
 */
export class AuthRepositoryImpl implements AuthRepository {
	private _authService: AppAuthService;
	private _logoutCount: number = 0;

	constructor(authService: AppAuthService) {
		this._authService = authService;
	}

	get logoutCount(): number {
		return this._logoutCount;
	}

	async login(credential: AuthCredential): Promise<AuthAccount | null> {
		const auth = await this._authService.login(credential);

		return auth;
	}

	async logout(): Promise<void> {
		this._logoutCount++;

		try {
			await this._authService.logout();
		} catch (error) {
			console.error("AuthRepositoryImpl.logout error:", error);
			// Don't throw - logout should always succeed locally
		}
	}

	async changePassword(oldPassword: string, newPassword: string): Promise<void> {
		await passwordService.changePassword({
			oldPassword,
			newPassword,
		});
	}
}
