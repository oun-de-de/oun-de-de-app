import { create } from "zustand";
import { GetIncomePosListUseCase } from "../../../../../core/domain/dashboard/usecases/get-income-pos-list-use-case";
import { DailyIncomePosInitialState, type DailyIncomePosState } from "./daily-income-pos-state";
import {
	DailyIncomePosLoadFirstErrorState,
	DailyIncomePosLoadFirstLoadingState,
	DailyIncomePosLoadFirstSuccessState,
} from "./states/get-state";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";
import { BaseStore } from "@/core/interfaces/base-store";
import {
	DailyIncomePosRepository,
	DailyIncomePosRepositoryImpl,
} from "@/core/domain/dashboard/repositories/daily-income-pos-repository";
import { Repository } from "@/service-locator";
import { createBoundStore } from "@/core/utils/create-bound-store";

type DailyIncomePosActions = {
	fetch: (id: FilterData) => Promise<void>;
};

export interface DailyIncomePosStore extends BaseStore<DailyIncomePosState, DailyIncomePosActions> {
	state: DailyIncomePosState;
	actions: {
		fetch: (id: FilterData) => Promise<void>;
		subscribe?: (state: DailyIncomePosState, prevState: DailyIncomePosState) => void;
	};
}

type Deps = {
	posRepo: DailyIncomePosRepository;
};

const createDailyIncomePosStore = ({ posRepo }: Deps) =>
	create<DailyIncomePosStore>((set, get) => ({
		state: DailyIncomePosInitialState(),
		actions: {
			async fetch(id: FilterData) {
				set({
					state: DailyIncomePosLoadFirstLoadingState(get().state, id),
				});

				const result = await new GetIncomePosListUseCase(posRepo).getIncomePosList(id);

				result.fold(
					(failure) => {
						set({
							state: DailyIncomePosLoadFirstErrorState(get().state, failure),
						});
					},
					(list) => {
						set({
							state: DailyIncomePosLoadFirstSuccessState(get().state, list),
						});
					},
				);
			},
		},
	}));

export const dailyIncomePosStore = createBoundStore<DailyIncomePosStore>({
	createStore: () =>
		createDailyIncomePosStore({
			posRepo: Repository.get<DailyIncomePosRepository>(DailyIncomePosRepositoryImpl),
		}),
});
