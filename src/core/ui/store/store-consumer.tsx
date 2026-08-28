import { type ReactNode, useEffect, useMemo, useRef } from "react";
import type { BaseStore } from "../../interfaces/base-store";
import type { createBoundStore } from "../../utils/create-bound-store";

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
	const prevBuildStateRef = useRef<Store["state"]>(state);
	const prevListenStateRef = useRef<Store["state"]>(state);
	const builtUIRef = useRef<ReactNode>(null);

	// Rebuild UI if needed (store-builder behavior) — pure, no side effects here.
	const builtUI = useMemo(() => {
		const shouldBuild = buildWhen ? buildWhen(prevBuildStateRef.current, state) : true;
		prevBuildStateRef.current = state;

		if (shouldBuild) {
			builtUIRef.current = builder(state);
		}
		return builtUIRef.current;
	}, [state, builder, buildWhen]);

	// Call listener if needed (store-listener behavior) — side effect runs after commit,
	// not during render, so StrictMode double-invoke can't double-fire loadingOverlay etc.
	useEffect(() => {
		const shouldListen = listenWhen ? listenWhen(prevListenStateRef.current, state) : true;
		if (shouldListen) {
			listener(state, prevListenStateRef.current);
		}
		prevListenStateRef.current = state;
	}, [state, listener, listenWhen]);

	return builtUI;
}
