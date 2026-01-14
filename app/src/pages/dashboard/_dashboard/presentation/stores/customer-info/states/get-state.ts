import type { FailureType } from "@/types/failure";
import type { ErrorState } from "@/types/state";
import {
  type CustomerInfoState,
  CustomerInfoType,
  _CustomerInfoState,
} from "../customer-info-state";
import { CustomerSummaryItem } from "@/pages/dashboard/_dashboard/domain/entities/customer-info";

export interface CustomerInfoLoadFirstErrorState extends CustomerInfoState, ErrorState {}

export const CustomerInfoLoadFirstLoadingState = (
  state: CustomerInfoState,
): CustomerInfoState => _CustomerInfoState(state, CustomerInfoType.GetListLoading);

export const CustomerInfoLoadFirstSuccessState = (
  state: CustomerInfoState,
  list: CustomerSummaryItem[],
): CustomerInfoState => _CustomerInfoState(state, CustomerInfoType.GetListSuccess, list);

export const CustomerInfoLoadFirstErrorState = (
  state: CustomerInfoState,
  error: FailureType,
): CustomerInfoLoadFirstErrorState => ({
  ..._CustomerInfoState(state, CustomerInfoType.GetListError),
  error,
});

