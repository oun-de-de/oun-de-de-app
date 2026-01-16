import { create } from "zustand";
import {
  DailyIncomeAccountingInitialState,
  type DailyIncomeAccountingState,
} from "./daily-income-accounting-state";
import {
  DailyIncomeAccountingLoadFirstErrorState,
  DailyIncomeAccountingLoadFirstLoadingState,
  DailyIncomeAccountingLoadFirstSuccessState,
} from "./states/get-state";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";
import getIncomeAccountingListUseCase from "../../../../../core/domain/dashboard/usecases/get-income-account-list-use-case";

type DailyIncomeAccountingStore = {
  state: DailyIncomeAccountingState;
  actions: {
    fetch: (id: FilterData) => Promise<void>;
  };
};

const createDailyIncomeAccountingStore = create<DailyIncomeAccountingStore>((set, get) => ({
    state: DailyIncomeAccountingInitialState(),
    actions: {
      async fetch(id: FilterData) {
        const currentState = get().state;

        set({ state: DailyIncomeAccountingLoadFirstLoadingState(currentState, id)});

        const result = await getIncomeAccountingListUseCase.getIncomeAccountingList(id);

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
  }));

export const useDailyIncomeAccountingState = () => createDailyIncomeAccountingStore((store) => store.state);

export const useDashboardIncomeAccountingActions = () => createDailyIncomeAccountingStore((state) => state.actions);

export { createDailyIncomeAccountingStore };

