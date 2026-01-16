import { create } from "zustand";
import { DailyIncomeAccountingInitialState, type DailyIncomeAccountingState } from "./daily-income-accounting-state";
import {
	DailyIncomeAccountingLoadFirstErrorState,
	DailyIncomeAccountingLoadFirstLoadingState,
	DailyIncomeAccountingLoadFirstSuccessState,
} from "./states/get-state";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";
import { GetIncomeAccountingListUseCase } from "../../../../../core/domain/dashboard/usecases/get-income-account-list-use-case";
import { BaseStore } from "@/core/types/base-store";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { DailyIncomeAccountingRepository } from "@/core/domain/dashboard/repositories/daily-income-accounting-repository";
import Repository from "@/service-locator";

export type DailyIncomeAccountingStore = BaseStore<
	DailyIncomeAccountingState,
	{
		fetch: (id: FilterData) => Promise<void>;
	}
>;

type Deps = {
	accountingRepo: DailyIncomeAccountingRepository;
};

const depsValue: Deps = {
	accountingRepo: Repository.get<DailyIncomeAccountingRepository>("Daily-Income-Accounting"),
};

const { useState, useAction } = createBoundStore<
	DailyIncomeAccountingStore["state"],
	DailyIncomeAccountingStore["actions"],
	DailyIncomeAccountingStore,
	Deps
>({
	deps: depsValue,
	createStore: ({ accountingRepo }) =>
		create<DailyIncomeAccountingStore>((set, get) => ({
			state: DailyIncomeAccountingInitialState(),
			actions: {
				async fetch(id: FilterData) {
					const currentState = get().state;

					set({
						state: DailyIncomeAccountingLoadFirstLoadingState(currentState, id),
					});

					const result = await new GetIncomeAccountingListUseCase(accountingRepo).getIncomeAccountingList(id);

					result.fold(
						(failure) => {
							set({
								state: DailyIncomeAccountingLoadFirstErrorState(currentState, failure),
							});
						},
						(list) => {
							set({
								state: DailyIncomeAccountingLoadFirstSuccessState(currentState, list),
							});
						},
					);
				},
			},
		})),
});

export const useDailyIncomeAccountingState = useState;
export const useDailyIncomeAccountingActions = useAction;
