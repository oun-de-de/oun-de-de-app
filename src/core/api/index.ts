import { AuthNetworkService, NoAuthNetworkService, type NetworkService } from "./apiClient";

/**
 * Base API interface
 */
export interface BaseApi {
	readonly client: NetworkService;
	readonly noAuthClient: NetworkService;
}

/**
 * Main API abstract class
 * Provides authenticated and non-authenticated network clients
 */
export abstract class MainApi implements BaseApi {
	get client(): NetworkService {
		return AuthNetworkService.getInstance();
	}

	get noAuthClient(): NetworkService {
		return NoAuthNetworkService.getInstance();
	}
}

// Re-export types and classes from apiClient
export {
	AuthNetworkService,
	NoAuthNetworkService,
	CustomNetworkService,
	type NetworkService,
	type NetworkResponse,
	type NetworkRequestOptions,
} from "./apiClient";

export { default as apiClient } from "./apiClient";
