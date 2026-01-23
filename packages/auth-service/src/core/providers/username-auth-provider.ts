import { AuthCredential, AuthProvider } from "./auth-provider";
import { AuthLoginDTO } from "../models";
import { AuthToken } from "../tokens";

/**
 * Username authentication credential
 */
export class UsernameAuthCredential extends AuthCredential {
	constructor(
		providerId: string,
		public readonly username: string,
		public readonly password: string,
	) {
		super(providerId);
	}

	get identity(): string {
		return this.username;
	}

	copyWith(changes?: { username?: string; password?: string }): UsernameAuthCredential {
		return new UsernameAuthCredential(
			this.providerId,
			changes?.username ?? this.username,
			changes?.password ?? this.password,
		);
	}

	toMap(): Record<string, any> {
		return {
			username: this.username,
			password: this.password,
		};
	}
}

/**
 * Username authentication provider
 */
export abstract class UsernameAuthProvider<D> extends AuthProvider<D> {
	constructor(config: { providerId: string }) {
		super(config.providerId);
	}

	abstract login(credential: UsernameAuthCredential): Promise<AuthLoginDTO<D>>;

	abstract loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO<D>>;
}
