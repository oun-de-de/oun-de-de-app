
import type { BaseState } from "@/types/state";
import { FilterRangeId } from "../../../domain/entities/filter";
import { DailyIncomePoint } from "../../../domain/entities/daily-income-point";

export enum DailyIncomePosType {
  Initial = "Initial",
  GetListLoading = "GetListLoadingState",
  GetListSuccess = "GetListSuccessState",
  GetListError = "GetListErrorState",
}

export interface DailyIncomePosState extends BaseState<DailyIncomePosType> {
  list: DailyIncomePoint[];
  id?: FilterRangeId;
}

// --- Initial state ---
export const DailyIncomePosInitialState = (id?: FilterRangeId): DailyIncomePosState => ({
  type: DailyIncomePosType.Initial,
  list: [],
  id,
});


export const _DailyIncomePostState = (
  state: DailyIncomePosState,
  type: DailyIncomePosType,
  list?: DailyIncomePoint[],
  id?: FilterRangeId,
): DailyIncomePosState => ({
  id: id ?? state.id,
  list: list ?? state.list,
  type,
});