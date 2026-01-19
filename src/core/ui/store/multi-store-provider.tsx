import { ReactNode, createContext, useContext, useEffect, useRef } from "react";
import type { createBoundStore } from "../../utils/create-bound-store";
import { createTaggedLogger } from "../../utils/logger";
import { BaseStore } from "../../types/base-store";
import { isInitAble } from "../../types/init-able";

const logger = createTaggedLogger("MultiStoreProvider");

/**
 * Configuration for a store in MultiStoreProvider
 */
export interface StoreConfig {
	name: string;
	store: ReturnType<typeof createBoundStore>;
}

/**
 * Context to share store registry
 */
const StoreContext = createContext<Map<string, ReturnType<typeof createBoundStore>> | null>(null);

/**
 * Context for single store provider (imported from store-provider to avoid circular dependency)
 */
export const SingleStoreContext = createContext<ReturnType<typeof createBoundStore> | null>(null);

interface MultiStoreProviderProps {
	stores: StoreConfig[];
	children: ReactNode;
}

/**
 * MultiStoreProvider - Provider to share multiple Zustand stores with component tree
 * Auto-subscribes to stores with onStateChange callback
 *
 * @example
 * ```tsx
 * // 1. Create stores outside component
 * const dailyIncomePosStore = createBoundStore<DailyIncomePosStore, Deps>({
 *   deps: dailyIncomePosDeps,
 *   createStore: ({ posRepo }) => createDailyIncomePosStore(posRepo),
 * });
 *
 * // 2. Wrap app with MultiStoreProvider
 * <MultiStoreProvider
 *   stores={[
 *     {
 *       name: 'dailyIncomePos',
 *       store: dailyIncomePosStore,
 *     },
 *   ]}
 * >
 *   <App />
 * </MultiStoreProvider>
 *
 * // 3. In child component, get store by name
 * function MyComponent() {
 *   const dailyIncomePos = useStore('dailyIncomePos');
 *   const state = dailyIncomePos.useState();
 *   const actions = dailyIncomePos.useAction();
 * }
 * ```
 */
export function MultiStoreProvider({ stores, children }: MultiStoreProviderProps) {
	function buildRegistry(source: StoreConfig[]) {
		const registry = new Map<string, ReturnType<typeof createBoundStore>>();
		source.forEach((config) => {
			if (registry.has(config.name)) {
				logger.warn(`Store name conflict: "${config.name}" already registered`);
			}
			registry.set(config.name, config.store);
		});
		return registry;
	}

	// Initialize synchronously to avoid null context during first render
	const storeRegistryRef = useRef<Map<string, ReturnType<typeof createBoundStore>>>(buildRegistry(stores));

	// Keep registry in sync when `stores` changes and log registration
	useEffect(() => {
		storeRegistryRef.current = buildRegistry(stores);
		const keys = Array.from(storeRegistryRef.current.keys());
		logger.info(`Registered ${keys.length} stores:`, keys);

		// Initialize actions that implement InitAble
		stores.forEach((config) => {
			try {
				const storeApi = config.store.getStoreApi();
				const state = storeApi.getState();
				const actions = state.actions;

				// Check if actions object implements InitAble
				if (isInitAble(actions)) {
					logger.info(`Initializing store "${config.name}"`);
					const result = actions.initialize();
					if (result instanceof Promise) {
						result.catch((error) => {
							logger.error(`Error initializing store "${config.name}":`, error);
						});
					}
				}
			} catch (error) {
				logger.error(`Error initializing store "${config.name}":`, error);
			}
		});
	}, [stores]);

	// Auto-subscribe to stores with onStateChange callback
	useEffect(() => {
		const unsubscribers: (() => void)[] = [];

		stores.forEach((config) => {
			try {
				const unsubscribe = config.store.subscribe((state, prevState) => {
					logger.debug(`Store "${config.name}" state changed:`, {
						prevState,
						newState: state,
					});
				});
				unsubscribers.push(unsubscribe);
			} catch (error) {
				logger.error(`Error subscribing to store "${config.name}":`, error);
			}
		});

		// Cleanup: Auto-unsubscribe on unmount
		return () => {
			unsubscribers.forEach((unsubscribe) => unsubscribe());

			if (unsubscribers.length > 0) {
				logger.info(`Unsubscribed from ${unsubscribers.length} store(s)`);
			}
		};
	}, [stores]);

	return <StoreContext.Provider value={storeRegistryRef.current}>{children}</StoreContext.Provider>;
}

/**
 * Hook to get store from StoreProvider (no params) or MultiStoreProvider (with name)
 *
 * @overload
 * @returns Store from SingleStoreContext when used without parameters
 *
 * @overload
 * @param name - Name of the store registered in MultiStoreProvider
 * @returns Store object with typed useState and useAction
 *
 * @throws Error if store not found or provider not found
 *
 * @example
 * ```tsx
 * // With StoreProvider (no params)
 * function MyComponent() {
 *   const store = useStore<DailyIncomePosStore>();
 *   const state = store.useState();
 *   return <StoreBuilder store={store} builder={(state) => <UI />} />;
 * }
 *
 * // With MultiStoreProvider (with name)
 * function MyComponent() {
 *   const store = useStore<DailyIncomePosStore>('dailyIncomePos');
 *   const state = store.useState();
 *   return <StoreBuilder store={store} builder={(state) => <UI />} />;
 * }
 * ```
 */
// ╔════════════════════════════════════════════════════════════════╗
// ║ OVERLOAD 1: Without parameters (StoreProvider)                 ║
// ╚════════════════════════════════════════════════════════════════╝
export function useStore<Store extends BaseStore<Store["state"], Store["actions"]>>(): {
	useState: () => Store["state"];
	useAction: () => Store["actions"];
	getStoreApi: ReturnType<typeof createBoundStore>["getStoreApi"];
	subscribe: ReturnType<typeof createBoundStore>["subscribe"];
};

// ╔════════════════════════════════════════════════════════════════╗
// ║ OVERLOAD 2: With name parameter (MultiStoreProvider)           ║
// ╚════════════════════════════════════════════════════════════════╝
export function useStore<Store extends BaseStore<Store["state"], Store["actions"]>>(
	name: string,
): {
	useState: () => Store["state"];
	useAction: () => Store["actions"];
	getStoreApi: ReturnType<typeof createBoundStore>["getStoreApi"];
	subscribe: ReturnType<typeof createBoundStore>["subscribe"];
};

// ╔════════════════════════════════════════════════════════════════╗
// ║ IMPLEMENTATION: Handle both cases                              ║
// ║ name?: string  →  can be undefined or string                   ║
// ╚════════════════════════════════════════════════════════════════╝
export function useStore<Store extends BaseStore<Store["state"], Store["actions"]>>(
	name?: string,
): {
	useState: () => Store["state"];
	useAction: () => Store["actions"];
	getStoreApi: ReturnType<typeof createBoundStore>["getStoreApi"];
	subscribe: ReturnType<typeof createBoundStore>["subscribe"];
} {
	// ╔════════════════════════════════════════════════════════════════╗
	// ║ CASE 1: No name provided (StoreProvider)                       ║
	// ╚════════════════════════════════════════════════════════════════╝
	// Case 1: No name provided -> Get from SingleStoreContext (StoreProvider)
	if (name === undefined) {
		const store = useContext(SingleStoreContext);

		if (!store) {
			throw new Error(
				`[useStore] Cannot find SingleStoreContext. Make sure your component is wrapped with <StoreProvider>.`,
			);
		}

		return store as {
			useState: () => Store["state"];
			useAction: () => Store["actions"];
			getStoreApi: ReturnType<typeof createBoundStore>["getStoreApi"];
			subscribe: ReturnType<typeof createBoundStore>["subscribe"];
		};
	}

	// ╔════════════════════════════════════════════════════════════════╗
	// ║ CASE 2: Name provided (MultiStoreProvider)                     ║
	// ╚════════════════════════════════════════════════════════════════╝
	// Case 2: Name provided -> Get from MultiStoreProvider registry
	const registry = useContext(StoreContext);

	if (!registry) {
		throw new Error(
			`[useStore] Cannot find StoreContext. Make sure your component is wrapped with <MultiStoreProvider>.`,
		);
	}

	const store = registry.get(name);

	if (!store) {
		const availableStores = Array.from(registry.keys()).join(", ");
		throw new Error(`[useStore] Store "${name}" not found. Available stores: ${availableStores}`);
	}

	return store as {
		useState: () => Store["state"];
		useAction: () => Store["actions"];
		getStoreApi: ReturnType<typeof createBoundStore>["getStoreApi"];
		subscribe: ReturnType<typeof createBoundStore>["subscribe"];
	};
}

/**
 * Hook helper to create typed useStore hook for each store
 *
 * @example
 * ```tsx
 * const useDailyIncomePosStore = createStoreHook<DailyIncomePosStore>('dailyIncomePos');
 *
 * function MyComponent() {
 *   const store = useDailyIncomePosStore(); // Fully typed!
 *   const state = store.useState();
 *   const { fetch } = store.useAction();
 *
 *   // Can use with StoreBuilder
 *   return <StoreBuilder store={store} builder={(state) => <UI />} />;
 * }
 * ```
 */
export function createStoreHook<Store extends BaseStore<Store["state"], Store["actions"]>>(storeName: string) {
	return () => useStore<Store>(storeName);
}
