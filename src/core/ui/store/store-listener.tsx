import { ReactNode, useEffect, useRef } from "react";
import type { createBoundStore } from "../../utils/create-bound-store";
import { BaseStore } from "../../types/base-store";

/**
 * Listener callback that receives state changes
 */
export type StateListener<State> = (state: State, prevState: State) => void;

/**
 * Optional selector to filter specific state changes
 * Returns true if listener should be called
 */
export type StateSelector<State> = (prevState: State, currentState: State) => boolean;

interface StoreListenerProps<Store extends BaseStore<Store["state"], Store["actions"]>> {
	/** Bound store instance */
	store: ReturnType<typeof createBoundStore>;
	/** Listener callback triggered on state changes */
	listener: StateListener<Store["state"]>;
	/** Optional selector to only listen to specific state changes */
	listenWhen?: StateSelector<Store["state"]>;
	/** Child component to render */
	children: ReactNode;
}

/**
 * StoreListener - Listen to Zustand store state changes
 * Similar to BlocListener in Flutter
 *
 * @example
 * ```tsx
 * <StoreListener
 *   store={dailyIncomePosStore}
 *   listener={(state, prevState) => {
 *     if (state.type === "GetListSuccessState") {
 *       console.log("Data loaded:", state.list);
 *     }
 *   }}
 *   listenWhen={(state) => state.type} // Only listen when type changes
 * >
 *   <MyComponent />
 * </StoreListener>
 * ```
 */
export function StoreListener<Store extends BaseStore<Store["state"], Store["actions"]>>({
	store,
	listener,
	listenWhen,
	children,
}: StoreListenerProps<Store>) {
	const prevStateRef = useRef<Store["state"] | null>(null);

	useEffect(() => {
		// Get initial state
		const storeApi = store.getStoreApi();
		const currentState = storeApi.getState() as Store;
		prevStateRef.current = currentState.state;

		// Subscribe to store changes
		const unsubscribe = store.subscribe((state, prevState) => {
			// Check if we should listen to this change
			if (listenWhen) {
				const shouldListen = listenWhen(prevStateRef.current || prevState, state);

				// Only call listener if selector returns true
				if (shouldListen) {
					listener(state, prevState);
				}
			} else {
				// Call listener for any state change
				listener(state, prevState);
			}

			// Update reference
			prevStateRef.current = state;
		});

		return () => {
			unsubscribe();
		};
	}, [store, listenWhen]);

	return <>{children}</>;
}

/**
 * Hook to listen to store state changes
 * Similar to BlocListener but as a hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useStoreListener(dailyIncomePosStore, (state, prevState) => {
 *     if (state.type === "GetListSuccessState") {
 *       console.log("Data loaded");
 *     }
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useStoreListener<Store extends BaseStore<Store["state"], Store["actions"]>>(
	store: ReturnType<typeof createBoundStore>,
	listener: StateListener<Store["state"]>,
	listenWhen?: StateSelector<Store["state"]>,
) {
	const prevStateRef = useRef<Store["state"] | null>(null);

	useEffect(() => {
		// Get initial state
		const storeApi = store.getStoreApi();
		const currentState = storeApi.getState() as Store;
		prevStateRef.current = currentState.state;

		// Subscribe to store changes
		const unsubscribe = store.subscribe((state, prevState) => {
			// Check if we should listen to this change
			if (listenWhen) {
				const shouldListen = listenWhen(prevStateRef.current || prevState, state);

				// Only call listener if selector returns true
				if (shouldListen) {
					listener(state, prevState);
				}
			} else {
				// Call listener for any state change
				listener(state, prevState);
			}

			// Update reference
			prevStateRef.current = state;
		});

		return () => {
			unsubscribe();
		};
	}, [store, listenWhen]);
}
