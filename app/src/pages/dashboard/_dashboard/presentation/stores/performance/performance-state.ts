import type { BaseState } from "@/types/state";
import { PerformanceItem } from "../../../domain/entities/performance";

type PerformanceType =
  | "InitialState"
  | "GetListLoadingState"
  | "GetListSuccessState"
  | "GetListErrorState";

export type PerformanceState = BaseState<PerformanceType> & {
  list: PerformanceItem[];
};

// --- Initial state ---
export const PerformanceInitialState = (): PerformanceState => ({
  type: "InitialState",
  list: [],
});

export const _PerformanceState = ({ state, type, list,}: { state: PerformanceState; type: PerformanceType; list?: PerformanceItem[]; })
: PerformanceState => ({
  list: list ?? state.list,
  type,
});
