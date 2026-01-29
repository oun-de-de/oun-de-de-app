import { BaseStore } from "@/core/interfaces/base-store";
import { StateListener, StateSelector, StoreListener } from "./store-listener";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { ReactNode } from "react";

interface StoreListenerConfig<Store extends BaseStore<Store["state"], Store["actions"]>> {
	store: ReturnType<typeof createBoundStore>;
	listener: StateListener<Store["state"]>;
	listenWhen?: StateSelector<Store["state"]>;
}

interface MultiStoreListenerProps {
	listeners: StoreListenerConfig<any>[];
	children: ReactNode;
}

/**
 * MultiStoreListener
 * @example
 * <MultiStoreListener
 *   listeners={[
 *     {
 *       store: dailyIncomeStore,
 *       listener: (state) => console.log(state),
 *     },
 *     {
 *       store: authStore,
 *       listenWhen: (prev, curr) => prev.isLoggedIn !== curr.isLoggedIn,
 *       listener: (state) => console.log("Auth changed"),
 *     },
 *   ]}
 * >
 *   <Page />
 * </MultiStoreListener>
 */
export function MultiStoreListener({ listeners, children }: MultiStoreListenerProps) {
	return (
		<>
			{listeners.reduceRight((acc, config, index) => {
				return (
					<StoreListener key={index} store={config.store} listener={config.listener} listenWhen={config.listenWhen}>
						{acc}
					</StoreListener>
				);
			}, children)}
		</>
	);
}
