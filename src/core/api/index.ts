import { AuthNetworkService, NetworkService, NoAuthNetworkService } from "./network-service";

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
