import type { BaseState } from "@/types/state";
import { PerformanceItem } from "../../../domain/entities/performance";

export enum PerformanceType {
  Initial = "Initial",
  GetListLoading = "GetListLoadingState",
  GetListSuccess = "GetListSuccessState",
  GetListError = "GetListErrorState",
}

export interface PerformanceState extends BaseState<PerformanceType> {
  list: PerformanceItem[];
}

// --- Initial state ---
export const PerformanceInitialState = (): PerformanceState => ({
  type: PerformanceType.Initial,
  list: [],
});

export const _PerformanceState = (
  state: PerformanceState,
  type: PerformanceType,
  list?: PerformanceItem[],
): PerformanceState => ({
  list: list ?? state.list,
  type,
});
