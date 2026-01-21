import { AuthProvider } from "../providers";

/**
 * Interface for authentication provider manager
 */
export interface AuthProviderManagerPlatform {
	/**
	 * Map of registered providers
	 */
	readonly providers: Map<string, AuthProvider>;

	/**
	 * Get provider by ID
	 */
	getProvider(providerId: string): AuthProvider | null;

	/**
	 * Get default provider (first registered)
	 */
	getDefaultProvider(): AuthProvider | null;
}

/**
 * Default implementation of provider manager
 */
export class AuthProviderManager implements AuthProviderManagerPlatform {
	public readonly providers: Map<string, AuthProvider>;

	constructor(config: { providers: AuthProvider[] }) {
		this.providers = new Map(config.providers.map((provider) => [provider.providerId, provider]));
	}

	getProvider(providerId: string): AuthProvider | null {
		return this.providers.get(providerId) ?? null;
	}

	getDefaultProvider(): AuthProvider | null {
		const firstProvider = this.providers.values().next().value;
		return firstProvider ?? null;
	}

	/**
	 * Add a provider dynamically
	 */
	addProvider(provider: AuthProvider): void {
		this.providers.set(provider.providerId, provider);
	}

	/**
	 * Remove a provider
	 */
	removeProvider(providerId: string): boolean {
		return this.providers.delete(providerId);
	}

	/**
	 * Check if provider exists
	 */
	hasProvider(providerId: string): boolean {
		return this.providers.has(providerId);
	}
}
