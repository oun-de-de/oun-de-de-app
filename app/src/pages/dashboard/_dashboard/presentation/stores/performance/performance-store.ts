import { create } from "zustand";
import getPerformanceUseCase from "../../../domain/usecases/get-performance-use-case";
import {
  PerformanceInitialState,
  type PerformanceState,
} from "./performance-state";
import {
  PerformanceLoadFirstErrorState,
  PerformanceLoadFirstLoadingState,
  PerformanceLoadFirstSuccessState,
} from "./states/get-state";

type PerformanceStore = {
  state: PerformanceState | PerformanceLoadFirstErrorState;
  actions: {
    fetch: () => Promise<void>;
  };
};

const usePerformanceStore = create<PerformanceStore>((set, get) => ({
  state: PerformanceInitialState(),
  actions: {
    async fetch() {
      const currentState = get().state;

      // loading state
      set({ state: PerformanceLoadFirstLoadingState(currentState) });

      const result = await getPerformanceUseCase.getPerformance();

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
}));

export const usePerformanceState = () =>
  usePerformanceStore((store) => store.state);

export const usePerformanceActions = () =>
  usePerformanceStore((store) => store.actions);
