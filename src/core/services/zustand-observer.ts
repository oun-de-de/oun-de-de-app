import { createTaggedLogger } from "../utils/logger";

const logger = createTaggedLogger("ZustandObserver");

export interface ZustandObserverSettings {
	enabled: boolean;
	logStateChanges: boolean;
	logActions: boolean;
	logErrors: boolean;
	printStateFullData: boolean;
}

export interface ZustandObserverConfig {
	storeName: string;
	settings?: Partial<ZustandObserverSettings>;
}

const defaultSettings: ZustandObserverSettings = {
	enabled: true,
	logStateChanges: true,
	logActions: true,
	logErrors: true,
	printStateFullData: false,
};

/**
 * ZustandObserver - Global observer for Zustand stores
 * Similar to BlocObserver in Flutter, provides centralized logging and monitoring
 *
 * @example
 * ```ts
 * // Register stores
 * zustandObserver.registerStore("counterStore", counterStoreApi);
 *
 * // Log actions
 * zustandObserver.logAction("counterStore", "increment", { amount: 1 });
 *
 * // Log errors
 * zustandObserver.logError("counterStore", error, "fetchData");
 * ```
 */
export class ZustandObserver {
	private stores = new Map<string, any>();
	private settings: ZustandObserverSettings;

	constructor(settings: Partial<ZustandObserverSettings> = {}) {
		this.settings = { ...defaultSettings, ...settings };
	}

	/**
	 * Register a store for observation
	 * @param storeName - Name of the store
	 * @param storeApi - Zustand store API (from getStoreApi())
	 * @returns Unsubscribe function
	 */
	registerStore(storeName: string, storeApi: any) {
		if (!this.settings.enabled) return () => {};

		this.stores.set(storeName, storeApi);

		logger.info(`Store "${storeName}" registered`);

		// Subscribe to all state changes
		const unsubscribe = storeApi.subscribe((nextState: any, prevState: any) => {
			if (this.settings.logStateChanges) {
				logger.debug(`Store "${storeName}" state changed:`, {
					prevState: this.settings.printStateFullData ? prevState : "...",
					nextState: this.settings.printStateFullData ? nextState : "...",
				});
			}
		});

		return () => {
			unsubscribe();
			this.stores.delete(storeName);
			logger.info(`Store "${storeName}" unregistered`);
		};
	}

	/**
	 * Log action execution
	 * @param storeName - Name of the store
	 * @param actionName - Name of the action
	 * @param args - Action arguments (optional)
	 */
	logAction(storeName: string, actionName: string, args?: any) {
		if (!this.settings.enabled || !this.settings.logActions) return;

		logger.info(`Store "${storeName}" action "${actionName}" called`, args);
	}

	/**
	 * Log action error
	 * @param storeName - Name of the store
	 * @param error - Error object
	 * @param context - Error context (optional)
	 */
	logError(storeName: string, error: Error, context?: string) {
		if (!this.settings.enabled || !this.settings.logErrors) return;

		logger.error(`Store "${storeName}" error${context ? ` (${context})` : ""}:`, error);
	}

	/**
	 * Get all registered stores
	 */
	getStores() {
		return Array.from(this.stores.keys());
	}

	/**
	 * Update observer settings
	 */
	updateSettings(settings: Partial<ZustandObserverSettings>) {
		this.settings = { ...this.settings, ...settings };
	}

	/**
	 * Get current settings
	 */
	getSettings() {
		return { ...this.settings };
	}
}

// Global observer instance
export const zustandObserver = new ZustandObserver();
