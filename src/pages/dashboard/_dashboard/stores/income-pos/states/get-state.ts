import { FailureType } from "@/core/types/failure";
import { ErrorState, LoadingState } from "@/core/types/state";
import { DailyIncomePosState, _DailyIncomePostState } from "../daily-income-pos-state";
import { DailyIncomePos } from "@/core/domain/dashboard/entities/daily-income";
import { FilterData } from "@/core/domain/dashboard/entities/filter";

export const DailyIncomePosLoadFirstLoadingState = (
  state: DailyIncomePosState,
  id: FilterData,
): DailyIncomePosState & LoadingState =>
  _DailyIncomePostState({
    state,
    type: "GetListLoadingState",
    id,
  });

export const DailyIncomePosLoadFirstSuccessState = (
  state: DailyIncomePosState,
  list: DailyIncomePos[],
): DailyIncomePosState =>
  _DailyIncomePostState({
    state,
    type: "GetListSuccessState",
    list,
  });

export const DailyIncomePosLoadFirstErrorState = (
  state: DailyIncomePosState,
  error: FailureType,
): DailyIncomePosState & ErrorState => ({
  ..._DailyIncomePostState({
    state,
    type: "GetListErrorState",
  }),
  error,
});