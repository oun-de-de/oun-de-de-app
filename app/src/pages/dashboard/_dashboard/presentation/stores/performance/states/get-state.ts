import type { FailureType } from "@/types/failure";
import type { ErrorState } from "@/types/state";
import {
  type PerformanceState,
  PerformanceType,
  _PerformanceState,
} from "../performance-state";
import { PerformanceItem } from "@/pages/dashboard/_dashboard/domain/entities/performance";

export interface PerformanceLoadFirstErrorState extends PerformanceState, ErrorState {}

export const PerformanceLoadFirstLoadingState = (
  state: PerformanceState,
): PerformanceState => _PerformanceState(state, PerformanceType.GetListLoading);

export const PerformanceLoadFirstSuccessState = (
  state: PerformanceState,
  list: PerformanceItem[],
): PerformanceState => _PerformanceState(state, PerformanceType.GetListSuccess, list);

export const PerformanceLoadFirstErrorState = (
  state: PerformanceState,
  error: FailureType,
): PerformanceLoadFirstErrorState => ({
  ..._PerformanceState(state, PerformanceType.GetListError),
  error,
});
