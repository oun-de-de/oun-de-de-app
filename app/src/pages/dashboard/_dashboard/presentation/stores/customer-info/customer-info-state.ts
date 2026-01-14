import type { BaseState } from "@/types/state";
import { CustomerSummaryItem } from "../../../domain/entities/customer-info";

export enum CustomerInfoType {
  Initial = "Initial",
  GetListLoading = "GetListLoadingState",
  GetListSuccess = "GetListSuccessState",
  GetListError = "GetListErrorState",
}

export interface CustomerInfoState extends BaseState<CustomerInfoType> {
  list: CustomerSummaryItem[];
}

// --- Initial state ---
export const CustomerInfoInitialState = (): CustomerInfoState => ({
  type: CustomerInfoType.Initial,
  list: [],
});

export const _CustomerInfoState = (
  state: CustomerInfoState,
  type: CustomerInfoType,
  list?: CustomerSummaryItem[],
): CustomerInfoState => ({
  list: list ?? state.list,
  type,
});

