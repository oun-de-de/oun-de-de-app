import type { FailureType } from "@/types/failure";
import type { ErrorState } from "@/types/state";
import {
  type PerformanceState,
  _PerformanceState,
} from "../performance-state";
import { PerformanceItem } from "@/pages/dashboard/_dashboard/domain/entities/performance";

export const PerformanceLoadFirstLoadingState = (
  state: PerformanceState,
): PerformanceState => _PerformanceState({
  state: state,
  type: "GetListLoadingState"
});

export const PerformanceLoadFirstSuccessState = (
  state: PerformanceState,
  list: PerformanceItem[],
): PerformanceState => _PerformanceState({
  state: state,
  type: "GetListSuccessState",
  list: list
});

export const PerformanceLoadFirstErrorState = (
  state: PerformanceState,
  error: FailureType,
): PerformanceState & ErrorState => ({
  ..._PerformanceState({
    state: state,
    type: "GetListErrorState"
  }),
  error,
});
