import { useRef, useMemo, ReactNode } from "react";
import type { createBoundStore } from "../../utils/create-bound-store";
import { BaseStore } from "../../types/base-store";

/**
 * Builder callback that receives state and returns ReactNode
 */
export type StateBuilder<State> = (state: State) => ReactNode;

/**
 * Listener callback for side effects when state changes
 */
export type StateListener<State> = (state: State, prevState: State) => void;

/**
 * Optional selector to filter specific state changes
 * Returns true if component should rebuild/listen
 */
export type StateSelector<State> = (prevState: State, currentState: State) => boolean;

interface StoreConsumerProps<Store extends BaseStore<Store["state"], Store["actions"]>> {
	/** Bound store instance */
	store: ReturnType<typeof createBoundStore>;
	/** Builder callback that receives state and returns UI */
	builder: StateBuilder<Store["state"]>;
	/** Listener callback for side effects */
	listener: StateListener<Store["state"]>;
	/** Optional selector to only listen when specific state changes */
	listenWhen?: StateSelector<Store["state"]>;
}

/**
 * StoreConsumer - Combination of StoreListener and StoreBuilder
 * Rebuild UI and trigger side effects when store state changes
 * Similar to BlocConsumer in Flutter
 *
 * @example
 * ```tsx
 * <StoreConsumer
 *   store={dailyIncomePosStore}
 *   builder={(state) => (
 *     <>
 *       {state.type === "GetListLoadingState" && <Skeleton />}
 *       {state.type === "GetListSuccessState" && <List items={state.list} />}
 *     </>
 *   )}
 *   listener={(state, prevState) => {
 *     if (state.type === "GetListErrorState") {
 *       toast.error(state.error.message);
 *     }
 *   }}
 *   listenWhen={(prev, curr) => curr.type === "GetListErrorState"}
 * />
 * ```
 */
export function StoreConsumer<Store extends BaseStore<Store["state"], Store["actions"]>>({
	store,
	builder,
	listener,
	listenWhen,
}: StoreConsumerProps<Store>) {
	const state = store.useState();
	const prevStateRef = useRef<Store["state"]>(state);

	const builtUI = useMemo(() => {
		let shouldListen = true;

		if (listenWhen) {
			shouldListen = listenWhen(prevStateRef.current, state);
		}

		// Call listener if needed
		if (shouldListen) {
			listener(state, prevStateRef.current);
		}

		prevStateRef.current = state;

		// Return built UI (always rebuilds on state change)
		return builder(state);
	}, [state, builder, listener, listenWhen]);

	return builtUI;
}
