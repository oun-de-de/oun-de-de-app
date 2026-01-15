import type { FailureType } from "@/types/failure";
import type { ErrorState } from "@/types/state";
import {
  type CustomerInfoState,
  _CustomerInfoState,
} from "../customer-info-state";
import { CustomerSummaryItem } from "@/pages/dashboard/_dashboard/domain/entities/customer-info";

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

