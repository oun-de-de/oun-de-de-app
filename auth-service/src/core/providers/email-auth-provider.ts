import { AuthCredential, AuthProvider } from "./auth-provider";
import { AuthLoginDTO } from "../models";
import { AuthToken } from "../tokens";

/**
 * Email authentication credential
 */
export class EmailAuthCredential extends AuthCredential {
	constructor(
		providerId: string,
		public readonly email: string,
		public readonly password: string,
	) {
		super(providerId);
	}

	get identity(): string {
		return this.email;
	}

	copyWith(changes?: { email?: string; password?: string }): EmailAuthCredential {
		return new EmailAuthCredential(this.providerId, changes?.email ?? this.email, changes?.password ?? this.password);
	}

	toMap(): Record<string, any> {
		return {
			email: this.email,
			password: this.password,
		};
	}
}

/**
 * Email authentication provider
 */
export abstract class EmailAuthProvider extends AuthProvider {
	constructor(config: { providerId: string }) {
		super(config.providerId);
	}

	abstract login(credential: EmailAuthCredential): Promise<AuthLoginDTO>;

	abstract loginWithAuthToken(token: AuthToken): Promise<AuthLoginDTO>;
}
