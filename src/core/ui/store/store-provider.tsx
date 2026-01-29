import { ReactNode, useContext, useEffect, useRef } from "react";
import type { createBoundStore } from "../../utils/create-bound-store";
import { createTaggedLogger } from "../../utils/logger";
import { isInitAble } from "../../interfaces/init-able";
import { useStore as useStoreFromMulti, SingleStoreContext } from "./multi-store-provider";

const logger = createTaggedLogger("StoreProvider");

interface StoreProviderProps<T extends ReturnType<typeof createBoundStore> = ReturnType<typeof createBoundStore>> {
	/** Bound store instance from createBoundStore() */
	store: T;
	/** Children components */
	children: ReactNode;
}

/**
 * StoreProvider - Provider for a single Zustand store
 * Similar to BlocProvider in Flutter, but for a single store
 *
 * @example
 * ```tsx
 * // 1. Create bound store outside component
 * const dailyIncomePosStore = createBoundStore<DailyIncomePosStore, Deps>({
 *   deps: dailyIncomePosDeps,
 *   createStore: ({ posRepo }) => createDailyIncomePosStore(posRepo),
 * });
 *
 * // 2. Wrap with StoreProvider
 * <StoreProvider store={dailyIncomePosStore}>
 *   <DashboardIncomePos />
 * </StoreProvider>
 *
 * // 3. Access store in child components
 * function DashboardIncomePos() {
 *   const store = useStoreContext();
 *   const state = store.useState();
 *   const { fetch } = store.useAction();
 * }
 * ```
 */
export function StoreProvider<T extends ReturnType<typeof createBoundStore>>({
	store,
	children,
}: StoreProviderProps<T>) {
	const storeRef = useRef(store);

	useEffect(() => {
		storeRef.current = store;
		logger.info("Store provider initialized");

		// Initialize actions that implement InitAble
		try {
			const storeApi = store.getStoreApi();
			const state = storeApi.getState();
			const actions = state.actions;

			// Check if actions object implements InitAble
			if (isInitAble(actions)) {
				logger.info("Initializing store");
				const result = actions.initialize();
				if (result instanceof Promise) {
					result.catch((error) => {
						logger.error("Error initializing store:", error);
					});
				}
			}
		} catch (error) {
			logger.error("Error initializing store:", error);
		}
	}, [store]);

	return <SingleStoreContext.Provider value={storeRef.current}>{children}</SingleStoreContext.Provider>;
}

/**
 * Hook to get the store from StoreProvider
 * @deprecated Use `useStore()` without parameters instead
 *
 * @returns Bound store instance
 * @throws Error if not wrapped with StoreProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const store = useStore<MyStore>(); // Preferred
 *   // or
 *   const store = useStoreContext(); // Deprecated
 *   const state = store.useState();
 *   const actions = store.useAction();
 * }
 * ```
 */
export function useStoreContext<T = ReturnType<typeof createBoundStore>>(): T {
	const store = useContext(SingleStoreContext);

	if (!store) {
		throw new Error(
			"[useStoreContext] Cannot find store context. Make sure your component is wrapped with <StoreProvider>.",
		);
	}

	return store as T;
}

/**
 * Unified hook to get store - works with both StoreProvider and MultiStoreProvider
 * Re-exported from multi-store-provider for convenience
 *
 * @example
 * ```tsx
 * // With StoreProvider (no params)
 * const store = useStore<MyStore>();
 *
 * // With MultiStoreProvider (with name)
 * const store = useStore<MyStore>('myStore');
 * ```
 */
export const useStore = useStoreFromMulti;
