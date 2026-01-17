import { create } from "zustand";
import { PerformanceInitialState, type PerformanceState } from "./performance-state";
import {
	PerformanceLoadFirstErrorState,
	PerformanceLoadFirstLoadingState,
	PerformanceLoadFirstSuccessState,
} from "./states/get-state";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { GetPerformanceUseCase } from "@/core/domain/dashboard/usecases/get-performance-use-case";
import { PerformanceRepository } from "@/core/domain/dashboard/repositories/performance-repository";
import Repository from "@/service-locator";
import { BaseStore } from "@/core/types/base-store";

export interface PerformanceStore extends BaseStore {
	state: PerformanceState;
	actions: {
		fetch: () => Promise<void>;
	};
}

type Deps = {
	performanceRepo: PerformanceRepository;
};

const depsValue: Deps = {
	performanceRepo: Repository.get<PerformanceRepository>("Performance"),
};

const { useState, useAction } = createBoundStore<PerformanceStore, Deps>({
	deps: depsValue,
	createStore: ({ performanceRepo }) =>
		create<PerformanceStore>((set, get) => ({
			state: PerformanceInitialState(),
			actions: {
				async fetch() {
					const currentState = get().state;

					set({ state: PerformanceLoadFirstLoadingState(currentState) });

					const result = await new GetPerformanceUseCase(performanceRepo).getPerformance();

					result.fold(
						(failure) => {
							set({
								state: PerformanceLoadFirstErrorState(currentState, failure),
							});
						},
						(list) => {
							set({
								state: PerformanceLoadFirstSuccessState(currentState, list),
							});
						},
					);
				},
			},
		})),
});

export const usePerformanceState = useState;
export const usePerformanceActions = useAction;
