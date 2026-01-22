import type { AuthProvider, AuthProviderManagerPlatform } from "@auth-service";
import { AppEmailAuthProvider } from "./email-auth-provider";
import { AppUsernameAuthProvider } from "./username-auth-provider";

/**
 * Provider manager for managing authentication providers
 */
export class AppAuthProviderManager implements AuthProviderManagerPlatform {
	public readonly providers: Map<string, AuthProvider> = new Map();
	private defaultProviderId: string = "username";

	constructor() {
		// Register default providers
		this.registerProvider("username", new AppUsernameAuthProvider());
		this.registerProvider("email", new AppEmailAuthProvider());
		// Add more providers as needed:
		// this.registerProvider("phone", new AppPhoneAuthProvider());
		// this.registerProvider("google", new AppGoogleAuthProvider());
	}

	registerProvider(providerId: string, provider: AuthProvider): void {
		this.providers.set(providerId, provider);
	}

	getProvider(providerId: string): AuthProvider | null {
		return this.providers.get(providerId) ?? null;
	}

	getDefaultProvider(): AuthProvider {
		const provider = this.providers.get(this.defaultProviderId);
		if (!provider) {
			throw new Error(`Default provider '${this.defaultProviderId}' not found`);
		}
		return provider;
	}

	getProviders(): AuthProvider[] {
		return Array.from(this.providers.values());
	}

	hasProvider(providerId: string): boolean {
		return this.providers.has(providerId);
	}
}
