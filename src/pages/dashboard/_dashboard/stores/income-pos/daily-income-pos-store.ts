import { create } from "zustand";
import getIncomePosListUseCase from "../../../../../core/domain/dashboard/usecases/get-income-pos-list-use-case";
import {
  DailyIncomePosInitialState,
  type DailyIncomePosState,
} from "./daily-income-pos-state";
import {
  DailyIncomePosLoadFirstErrorState,
  DailyIncomePosLoadFirstLoadingState,
  DailyIncomePosLoadFirstSuccessState,
} from "./states/get-state";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";

type DailyIncomePosStore = {
  state: DailyIncomePosState;
  actions: {
    fetch: (id: FilterData) => Promise<void>;
  };
};

const createDailyIncomePosStore = create<DailyIncomePosStore>((set, get) => ({
    state: DailyIncomePosInitialState(),
    actions: {
      async fetch(id: FilterData) {
        const currentState = get().state;

        set({ state: DailyIncomePosLoadFirstLoadingState(currentState, id)});

        const result = await getIncomePosListUseCase.getIncomePosList(id);

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
  }));

export const useDailyIncomePosState = () => createDailyIncomePosStore((store) => store.state);

export const useDashboardIncomePosActions = () => createDailyIncomePosStore((state) => state.actions);

export { createDailyIncomePosStore };

