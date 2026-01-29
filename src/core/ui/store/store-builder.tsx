import { useMemo, ReactNode, useRef } from "react";
import type { createBoundStore } from "../../utils/create-bound-store";
import { BaseStore } from "../../interfaces/base-store";
import { useStore } from "./multi-store-provider";

/**
 * Builder callback that receives state and returns ReactNode
 */
export type StateBuilder<State> = (state: State) => ReactNode;

/**
 * Optional selector to filter specific state changes
 * Returns true if component should rebuild
 */
export type StateSelector<State> = (prevState: State, currentState: State) => boolean;

interface StoreBuilderProps<Store extends BaseStore<Store["state"], Store["actions"]>> {
	/** Bound store instance (optional - use if you already have it) */
	store?: ReturnType<typeof createBoundStore>;
	/** Store name to retrieve from context (optional - use if store not provided) */
	storeName?: string;
	/** Builder callback that receives state and returns UI */
	builder: StateBuilder<Store["state"]>;
	/** Optional selector to only rebuild when specific state changes */
	buildWhen?: StateSelector<Store["state"]>;
}

/**
 * StoreBuilder - Rebuild UI when store state changes
 * Similar to BlocBuilder in Flutter
 *
 * @example
 * ```tsx
 * <StoreBuilder
 *   store={dailyIncomePosStore}
 *   builder={(state) => (
 *     <>
 *       {state.type === "GetListLoadingState" && <Skeleton />}
 *       {state.type === "GetListSuccessState" && (
 *         <List items={state.list} />
 *       )}
 *       {state.type === "GetListErrorState" && (
 *         <Error message={state.error.message} />
 *       )}
 *     </>
 *   )}
 *   buildWhen={(state) => state.type} // Only rebuild when type changes
 * />
 * ```
 */
export function StoreBuilder<Store extends BaseStore<Store["state"], Store["actions"]>>({
	store: storeFromProps,
	storeName,
	builder,
	buildWhen,
}: StoreBuilderProps<Store>) {
	// Use store from props if provided, otherwise retrieve from context using storeName
	const storeFromContext = storeName ? useStore<Store>(storeName) : undefined;
	const store = useMemo(() => storeFromProps || storeFromContext, [storeFromProps, storeFromContext]);

	if (!store) {
		throw new Error("StoreBuilder: Either 'store' prop or 'storeName' prop must be provided");
	}

	// Use store's built-in useState hook to get state updates
	const state = store.useState();

	// Track previous state for buildWhen selector
	const prevStateRef = useRef<Store["state"]>(state);
	// Track previous UI to keep rendering when buildWhen returns false
	const builtUIRef = useRef<ReactNode>(null);

	const builtUI = useMemo(() => {
		let shouldRender = true;

		if (buildWhen) {
			// Check if should rebuild based on state change
			shouldRender = buildWhen(prevStateRef.current, state);
		}

		// Update ref after check
		prevStateRef.current = state;

		if (shouldRender) {
			const newUI = builder(state);
			builtUIRef.current = newUI;
			return newUI;
		}

		// Return previous UI if shouldn't rebuild
		return builtUIRef.current;
	}, [state, builder, buildWhen]);

	return builtUI;
}
