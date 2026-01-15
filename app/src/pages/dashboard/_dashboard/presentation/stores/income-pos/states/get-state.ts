import { FailureType } from "@/types/failure";
import { ErrorState, LoadingState } from "@/types/state";
import { DailyIncomePosState, _DailyIncomePostState } from "../daily-income-pos-state";
import { DailyIncomePos } from "@/pages/dashboard/_dashboard/domain/entities/daily-income";
import { FilterData } from "@/pages/dashboard/_dashboard/domain/entities/filter";

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