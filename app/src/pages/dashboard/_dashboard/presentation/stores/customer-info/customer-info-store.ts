import { create } from "zustand";
import getCustomerInfoUseCase from "../../../domain/usecases/get-customer-info-use-case";
import {
  CustomerInfoInitialState,
  type CustomerInfoState,
} from "./customer-info-state";
import {
  CustomerInfoLoadFirstErrorState,
  CustomerInfoLoadFirstLoadingState,
  CustomerInfoLoadFirstSuccessState,
} from "./states/get-state";

type CustomerInfoStore = {
  state: CustomerInfoState | CustomerInfoLoadFirstErrorState;
  actions: {
    fetch: () => Promise<void>;
  };
};

const useCustomerInfoStore = create<CustomerInfoStore>((set, get) => ({
  state: CustomerInfoInitialState(),
  actions: {
    async fetch() {
      const currentState = get().state;

      // loading state
      set({ state: CustomerInfoLoadFirstLoadingState(currentState) });

      const result = await getCustomerInfoUseCase.getCustomerInfo();

      result.fold(
        (failure) => {
          set({
            state: CustomerInfoLoadFirstErrorState(currentState, failure),
          });
        },
        (list) => {
          set({
            state: CustomerInfoLoadFirstSuccessState(currentState, list),
          });
        },
      );
    },
  },
}));

export const useCustomerInfoState = () =>
  useCustomerInfoStore((store) => store.state);

export const useCustomerInfoActions = () =>
  useCustomerInfoStore((store) => store.actions);

