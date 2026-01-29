import { create } from "zustand";
import { DailyIncomeAccountingInitialState, type DailyIncomeAccountingState } from "./daily-income-accounting-state";
import {
	DailyIncomeAccountingLoadFirstErrorState,
	DailyIncomeAccountingLoadFirstLoadingState,
	DailyIncomeAccountingLoadFirstSuccessState,
} from "./states/get-state";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";
import { GetIncomeAccountingListUseCase } from "../../../../../core/domain/dashboard/usecases/get-income-account-list-use-case";
import { BaseStore } from "@/core/interfaces/base-store";
import {
	DailyIncomeAccountingRepository,
	DailyIncomeAccountingRepositoryImpl,
} from "@/core/domain/dashboard/repositories/daily-income-accounting-repository";
import { Repository } from "@/service-locator";
import { createBoundStore } from "@/core/utils/create-bound-store";

type DailyIncomeAccountingActions = {
	fetch: (id: FilterData) => Promise<void>;
};

export interface DailyIncomeAccountingStore
	extends BaseStore<DailyIncomeAccountingState, DailyIncomeAccountingActions> {
	state: DailyIncomeAccountingState;
	actions: {
		fetch: (id: FilterData) => Promise<void>;
	};
}

type Deps = {
	accountingRepo: DailyIncomeAccountingRepository;
};

const createDailyIncomeAccountingStore = ({ accountingRepo }: Deps) =>
	create<DailyIncomeAccountingStore>((set, get) => ({
		state: DailyIncomeAccountingInitialState(),
		actions: {
			async fetch(id: FilterData) {
				set({
					state: DailyIncomeAccountingLoadFirstLoadingState(get().state, id),
				});

				const result = await new GetIncomeAccountingListUseCase(accountingRepo).getIncomeAccountingList(id);

				result.fold(
					(failure) => {
						set({
							state: DailyIncomeAccountingLoadFirstErrorState(get().state, failure),
						});
					},
					(list) => {
						set({
							state: DailyIncomeAccountingLoadFirstSuccessState(get().state, list),
						});
					},
				);
			},
		},
	}));

export const dailyIncomeAccountingBoundStore = createBoundStore<DailyIncomeAccountingStore>({
	createStore: () =>
		createDailyIncomeAccountingStore({
			accountingRepo: Repository.get<DailyIncomeAccountingRepository>(DailyIncomeAccountingRepositoryImpl),
		}),
});
