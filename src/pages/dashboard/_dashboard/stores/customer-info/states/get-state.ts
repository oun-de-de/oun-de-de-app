import type { FailureType } from "@/core/types/failure";
import type { ErrorState } from "@/core/types/state";
import {
  type CustomerInfoState,
  _CustomerInfoState,
} from "../customer-info-state";
import { CustomerSummaryItem } from "@/core/domain/dashboard/entities/customer-info";

export const CustomerInfoLoadFirstLoadingState = (
  state: CustomerInfoState,
): CustomerInfoState => _CustomerInfoState({
  state: state,
  type: "GetListLoadingState"
});

export const CustomerInfoLoadFirstSuccessState = (
  state: CustomerInfoState,
  list: CustomerSummaryItem[],
): CustomerInfoState => _CustomerInfoState({
  state: state,
  type: "GetListSuccessState",
  list: list
});

export const CustomerInfoLoadFirstErrorState = (
  state: CustomerInfoState,
  error: FailureType,
): CustomerInfoState & ErrorState  => ({
  ..._CustomerInfoState({
    state: state,
    type: "GetListErrorState"
  }),
  error,
});

