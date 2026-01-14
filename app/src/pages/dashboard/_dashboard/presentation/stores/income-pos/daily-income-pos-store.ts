import { create } from "zustand";
import getIncomePosListUseCase from "../../../domain/usecases/get-income-pos-list-use-case";
import {
  DailyIncomePosInitialState,
  DailyIncomePosType,
  type DailyIncomePosState,
} from "./daily-income-pos-state";
import {
  DailyIncomePosLoadFirstErrorState,
  DailyIncomePosLoadFirstLoadingState,
  DailyIncomePosLoadFirstSuccessState,
} from "./states/get-state";
import { FilterRangeId } from "../../../domain/entities/filter";

type DailyIncomePosStore = {
  state: DailyIncomePosState;
  actions: {
    init: (id: FilterRangeId) => void;
    fetch: (id: FilterRangeId) => Promise<void>;
  };
};

const createDailyIncomePosStore = create<DailyIncomePosStore>((set, get) => ({
    state: DailyIncomePosInitialState(),
    actions: {
      init(newId: FilterRangeId) {
        set((store) => {
          if (store.state.type === DailyIncomePosType.Initial) {
            return { state: DailyIncomePosInitialState(newId) };
          }
          return store;
        });
      },
      async fetch(id: FilterRangeId) {
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

