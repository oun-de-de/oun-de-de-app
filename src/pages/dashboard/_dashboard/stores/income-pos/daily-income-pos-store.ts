import { create } from "zustand";
import { GetIncomePosListUseCase } from "../../../../../core/domain/dashboard/usecases/get-income-pos-list-use-case";
import { DailyIncomePosInitialState, type DailyIncomePosState } from "./daily-income-pos-state";
import {
	DailyIncomePosLoadFirstErrorState,
	DailyIncomePosLoadFirstLoadingState,
	DailyIncomePosLoadFirstSuccessState,
} from "./states/get-state";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";
import { BaseStore } from "@/core/types/base-store";
import {
	DailyIncomePosRepository,
	DailyIncomePosRepositoryImpl,
} from "@/core/domain/dashboard/repositories/daily-income-pos-repository";
import { createBoundStore } from "@/core/utils/create-bound-store";
import Repository from "@/service-locator";

export type DailyIncomePosStore = BaseStore<
	DailyIncomePosState,
	{
		fetch: (id: FilterData) => Promise<void>;
	}
>;

type Deps = {
	posRepo: DailyIncomePosRepository;
};

const depsValue: Deps = {
	posRepo: Repository.get<DailyIncomePosRepository>(DailyIncomePosRepositoryImpl),
};

const { useState, useAction } = createBoundStore<
	DailyIncomePosStore["state"],
	DailyIncomePosStore["actions"],
	DailyIncomePosStore,
	Deps
>({
	deps: depsValue,
	createStore: ({ posRepo }) =>
		create<DailyIncomePosStore>((set, get) => ({
			state: DailyIncomePosInitialState(),
			actions: {
				async fetch(id: FilterData) {
					const currentState = get().state;

					set({
						state: DailyIncomePosLoadFirstLoadingState(currentState, id),
					});

					const result = await new GetIncomePosListUseCase(posRepo).getIncomePosList(id);

					result.fold(
						(failure) => {
							set({
								state: DailyIncomePosLoadFirstErrorState(currentState, failure),
							});
						},
						(list) => {
							set({
								state: DailyIncomePosLoadFirstSuccessState(currentState, list),
							});
						},
					);
				},
			},
		})),
});

export const useDailyIncomePosState = useState;
export const useDailyIncomePosActions = useAction;
