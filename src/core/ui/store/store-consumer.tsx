import { useRef, useMemo, ReactNode } from "react";
import type { createBoundStore } from "../../utils/create-bound-store";
import { BaseStore } from "../../interfaces/base-store";

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
	/** Optional selector to only rebuild when specific state changes */
	buildWhen?: StateSelector<Store["state"]>;
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
 *   buildWhen={(prev, curr) => prev.type !== curr.type}
 *   listenWhen={(prev, curr) => curr.type === "GetListErrorState"}
 * />
 * ```
 */
export function StoreConsumer<Store extends BaseStore<Store["state"], Store["actions"]>>({
	store,
	builder,
	listener,
	buildWhen,
	listenWhen,
}: StoreConsumerProps<Store>) {
	const state = store.useState();
	const prevStateRef = useRef<Store["state"]>(state);
	const builtUIRef = useRef<ReactNode>(null);

	const builtUI = useMemo(() => {
		let shouldBuild = true;
		let shouldListen = true;

		// Check if should rebuild UI (from store-builder.tsx)
		if (buildWhen) {
			shouldBuild = buildWhen(prevStateRef.current, state);
		}

		// Check if should call listener (from store-listener.tsx)
		if (listenWhen) {
			shouldListen = listenWhen(prevStateRef.current, state);
		}
		// Call listener if needed (store-listener behavior)
		if (shouldListen) {
			listener(state, prevStateRef.current);
		}

		// Update ref after checks
		prevStateRef.current = state;

		// Rebuild UI if needed (store-builder behavior)
		if (shouldBuild) {
			const newUI = builder(state);
			builtUIRef.current = newUI;
			return newUI;
		}

		// Return cached UI if shouldn't rebuild
		return builtUIRef.current;
	}, [state, builder, listener, buildWhen, listenWhen]);

	return builtUI;
}
