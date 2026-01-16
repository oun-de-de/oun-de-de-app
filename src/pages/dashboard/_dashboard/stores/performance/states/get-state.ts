import type { FailureType } from "@/core/types/failure";
import type { ErrorState } from "@/core/types/state";
import {
  type PerformanceState,
  _PerformanceState,
} from "../performance-state";
import { PerformanceItem } from "@/core/domain/dashboard/entities/performance";

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
