import type { BaseState } from "@/core/types/state";
import { CustomerSummaryItem } from "../../../../../core/domain/dashboard/entities/customer-info";

type CustomerInfoType =
  | "InitialState"
  | "GetListLoadingState"
  | "GetListSuccessState"
  | "GetListErrorState";

export type CustomerInfoState = BaseState<CustomerInfoType> & {
  list: CustomerSummaryItem[];
};

// --- Initial state ---
export const CustomerInfoInitialState = (): CustomerInfoState => ({
  type: "InitialState",
  list: [],
});

export const _CustomerInfoState = ({
  state,
  type,
  list,
}: {
  state: CustomerInfoState;
  type: CustomerInfoType;
  list?: CustomerSummaryItem[];
}): CustomerInfoState => ({
  list: list ?? state.list,
  type,
});