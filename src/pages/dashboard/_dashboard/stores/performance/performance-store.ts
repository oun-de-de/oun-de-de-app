import { create } from "zustand";
import { PerformanceInitialState, type PerformanceState } from "./performance-state";
import {
	PerformanceLoadFirstErrorState,
	PerformanceLoadFirstLoadingState,
	PerformanceLoadFirstSuccessState,
} from "./states/get-state";
import { GetPerformanceUseCase } from "@/core/domain/dashboard/usecases/get-performance-use-case";
import {
	PerformanceRepository,
	PerformanceRepositoryImpl,
} from "@/core/domain/dashboard/repositories/performance-repository";
import { BaseStore } from "@/core/interfaces/base-store";
import { Repository } from "@/service-locator";
import { createBoundStore } from "@/core/utils/create-bound-store";

type PerformanceActions = {
	fetch: () => Promise<void>;
};

export interface PerformanceStore extends BaseStore<PerformanceState, PerformanceActions> {
	state: PerformanceState;
	actions: {
		fetch: () => Promise<void>;
	};
}

export type Deps = {
	performanceRepo: PerformanceRepository;
};

const createPerformanceStore = ({ performanceRepo }: Deps) =>
	create<PerformanceStore>((set, get) => ({
		state: PerformanceInitialState(),
		actions: {
			async fetch() {
				set({ state: PerformanceLoadFirstLoadingState(get().state) });

				const result = await new GetPerformanceUseCase(performanceRepo).getPerformance();

				result.fold(
					(failure) => {
						set({
							state: PerformanceLoadFirstErrorState(get().state, failure),
						});
					},
					(list) => {
						set({
							state: PerformanceLoadFirstSuccessState(get().state, list),
						});
					},
				);
			},
		},
	}));

export const performanceBoundStore = createBoundStore<PerformanceStore>({
	createStore: () =>
		createPerformanceStore({
			performanceRepo: Repository.get<PerformanceRepository>(PerformanceRepositoryImpl),
		}),
});
