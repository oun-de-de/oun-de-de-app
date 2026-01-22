import { BehaviorSubject, filter, type Observable } from "rxjs";
import {
	EmptyAuthProviderException,
	RefreshTokenFailedException,
	UnsupportedAuthProviderException,
	UnsupportedValueForAuthenticateException,
} from "./exceptions";
import type { AuthLocalStoragePlatform } from "./interfaces/auth-local-storage";
import type { AuthProviderManagerPlatform } from "./interfaces/auth-provider-manager";
import {
	type AuthAccount,
	type AuthAccountMapper,
	AuthenticationStatus,
	type AuthLoginDTO,
	createPhoneAuthOtp,
	type PhoneAuthOtp,
	type PhoneOtpMapper,
} from "./models";
import { AuthCredential, type AuthProvider, type PhoneAuthCredential, PhoneAuthProvider } from "./providers";
import type { AuthToken } from "./tokens";

/**
 * Abstract authentication service
 * Handles user authentication, token management, and state tracking
 */
export abstract class AuthService<T extends AuthAccount> {
	/**
	 * Provider manager containing registered auth providers
	 */
	protected abstract get providerManager(): AuthProviderManagerPlatform;

	/**
	 * Local storage for persisting authentication state
	 * Return null to disable local storage
	 */
	protected get localStorage(): AuthLocalStoragePlatform<T> | null {
		return null;
	}

	/**
	 * Account mapper for converting DTOs to AuthAccount
	 */
	protected abstract get accountMapper(): AuthAccountMapper<T>;

	/**
	 * Phone OTP mapper (optional)
	 */
	protected get phoneOtpMapper(): PhoneOtpMapper | null {
		return null;
	}

	/**
	 * Current authenticated user
	 */
	protected currentUser: T | null = null;

	/**
	 * Get current user
	 */
	public getCurrentUser(): T | null {
		return this.currentUser;
	}

	/**
	 * Authentication state subject
	 */
	private readonly authStateSubject = new BehaviorSubject<T | null>(null);

	/**
	 * Observable stream of all authentication state changes
	 */
	public get authStateChanges(): Observable<T | null> {
		return this.authStateSubject.asObservable();
	}

	/**
	 * Observable stream of authenticated states only
	 */
	public get authenticatedStream(): Observable<T> {
		return this.authStateChanges.pipe(
			filter((auth): auth is T => auth !== null && auth.authStatus === AuthenticationStatus.Authenticated),
		);
	}

	/**
	 * Observable stream of unauthenticated states
	 */
	public get unauthenticatedStream(): Observable<T | null> {
		return this.authStateChanges.pipe(
			filter((auth) => auth === null || auth.authStatus === AuthenticationStatus.Unauthenticated),
		);
	}

	/**
	 * Initialize the authentication service
	 */
	public async initialize(): Promise<void> {
		await this.tryAuthenticateWhenStart();
	}

	/**
	 * Try to authenticate user on service start
	 * Loads saved authentication and refreshes if needed
	 */
	protected async tryAuthenticateWhenStart(): Promise<T | null> {
		try {
			const account = await this.localStorage?.loadLocalAuthentication();
			if (!account) return null;

			return await this.refreshAccessToken(account);
		} catch (error) {
			// TODO: Log error
			console.error("Failed to authenticate on start:", error);
			return null;
		}
	}

	/**
	 * Login with credentials
	 */
	public async login(credential: AuthCredential): Promise<T | null> {
		return this.authenticate(credential, {
			updateUser: true,
			saveLocal: true,
			notify: true,
		});
	}

	/**
	 * Login with auth token
	 */
	public async loginWithAuthToken(token: AuthToken): Promise<T | null> {
		return this.authenticate(token, {
			updateUser: true,
			saveLocal: true,
			notify: true,
		});
	}

	/**
	 * Check if value can authenticate without updating state
	 */
	public async checkAuthenticate(value: AuthToken | AuthCredential): Promise<boolean> {
		try {
			const auth = await this.authenticate(value, {
				updateUser: false,
				saveLocal: false,
				notify: false,
			});
			return auth !== null;
		} catch {
			return false;
		}
	}

	/**
	 * Core authentication method
	 */
	protected async authenticate(
		value: AuthToken | AuthCredential,
		options: {
			updateUser: boolean;
			saveLocal: boolean;
			notify: boolean;
		},
	): Promise<T | null> {
		let authLoginDTO: AuthLoginDTO;
		let provider: AuthProvider | null = null;
		let credential: AuthCredential | null = null;

		if (value instanceof AuthCredential) {
			credential = value;
			const providerId = credential.providerId;

			provider = this.providerManager.getProvider(providerId);
			if (!provider) {
				throw new UnsupportedAuthProviderException(providerId);
			}

			authLoginDTO = await provider.login(credential);
		} else if (this.isAuthToken(value)) {
			const token = value;
			const providerId = this.currentUser?.providerId;

			provider = providerId ? this.providerManager.getProvider(providerId) : this.providerManager.getDefaultProvider();

			if (!provider) {
				throw new EmptyAuthProviderException();
			}

			authLoginDTO = await provider.loginWithAuthToken(token);
		} else {
			throw new UnsupportedValueForAuthenticateException(value);
		}

		const account = this.accountMapper.fromLogin(authLoginDTO, provider, credential);

		if (!options.updateUser) {
			return account;
		}

		return this.updateCurrentUser(account, {
			saveLocal: options.saveLocal,
			notify: options.notify,
		});
	}

	/**
	 * Update current user and notify listeners
	 */
	protected async updateCurrentUser(account: T, options: { saveLocal: boolean; notify: boolean }): Promise<T> {
		this.currentUser = account;

		if (options.saveLocal && this.localStorage) {
			try {
				await this.localStorage.saveLocalAuthentication(account);
			} catch (error) {
				console.error("Failed to save authentication locally:", error);
			}
		}

		if (options.notify) {
			this.authStateSubject.next(account);
		}

		return account;
	}

	/**
	 * Refresh access token using refresh token
	 */
	public async refreshAccessToken(account: T | null = null): Promise<T | null> {
		const targetAccount = account ?? this.currentUser;

		if (!targetAccount?.refreshToken?.isValid) {
			throw new RefreshTokenFailedException("No valid refresh token available");
		}

		try {
			const refreshedAccount = await this.authenticate(targetAccount.refreshToken, {
				updateUser: true,
				saveLocal: true,
				notify: true,
			});

			return refreshedAccount;
		} catch (error) {
			// If refresh fails, logout user
			await this.logout();
			throw new RefreshTokenFailedException(
				`Failed to refresh token: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Logout current user
	 */
	public async logout(): Promise<void> {
		this.currentUser = null;

		if (this.localStorage) {
			try {
				await this.localStorage.clearLocalAuthentication();
			} catch (error) {
				console.error("Failed to clear local authentication:", error);
			}
		}

		this.authStateSubject.next(null);
	}

	/**
	 * Request OTP for phone authentication
	 */
	public async requestOtp(credential: PhoneAuthCredential): Promise<PhoneAuthOtp> {
		const provider = this.providerManager.getProvider(credential.providerId);

		if (!provider) {
			throw new UnsupportedAuthProviderException(credential.providerId);
		}

		if (!(provider instanceof PhoneAuthProvider)) {
			throw new Error(`Provider '${credential.providerId}' does not support phone authentication`);
		}

		const otpDTO = await provider.requestOtp(credential);

		// Use mapper if provided, otherwise create default PhoneAuthOtp
		const otpInfo = this.phoneOtpMapper
			? this.phoneOtpMapper.fromRequestOtp(otpDTO, provider, credential)
			: createPhoneAuthOtp({
					provider,
					credential,
					sendDate: new Date(),
				});

		return otpInfo;
	}

	/**
	 * Verify OTP and login
	 */
	public async verifyOtp(credential: PhoneAuthCredential): Promise<T | null> {
		const provider = this.providerManager.getProvider(credential.providerId);

		if (!provider) {
			throw new UnsupportedAuthProviderException(credential.providerId);
		}

		if (!(provider instanceof PhoneAuthProvider)) {
			throw new Error(`Provider '${credential.providerId}' does not support phone authentication`);
		}

		const loginDTO = await provider.verifyOtp(credential);

		const account = this.accountMapper.fromLogin(loginDTO, provider, credential);

		return this.updateCurrentUser(account, {
			saveLocal: true,
			notify: true,
		});
	}

	/**
	 * Type guard for AuthToken
	 */
	private isAuthToken(value: unknown): value is AuthToken {
		if (!value || typeof value !== "object") {
			return false;
		}
		const obj = value as Record<string, unknown>;
		return "type" in obj && "value" in obj && "authorizationValue" in obj && "isValid" in obj;
	}

	/**
	 * Dispose resources
	 */
	public dispose(): void {
		this.authStateSubject.complete();
	}
}
