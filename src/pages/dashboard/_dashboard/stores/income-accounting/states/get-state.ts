import { FailureType } from "@/core/types/failure";
import { ErrorState, LoadingState } from "@/core/types/state";
import { DailyIncomeAccountingState, _DailyIncomeAccountingState } from "../daily-income-accounting-state";
import { DailyIncomeAccounting } from "@/core/domain/dashboard/entities/daily-income";
import { FilterData } from "@/core/domain/dashboard/entities/filter";

export const DailyIncomeAccountingLoadFirstLoadingState = (
  state: DailyIncomeAccountingState,
  id: FilterData,
): DailyIncomeAccountingState & LoadingState =>
  _DailyIncomeAccountingState({
    state,
    type: "GetListLoadingState",
    id,
  });

export const DailyIncomeAccountingLoadFirstSuccessState = (
  state: DailyIncomeAccountingState,
  list: DailyIncomeAccounting[],
): DailyIncomeAccountingState =>
  _DailyIncomeAccountingState({
    state,
    type: "GetListSuccessState",
    list,
  });

export const DailyIncomeAccountingLoadFirstErrorState = (
  state: DailyIncomeAccountingState,
  error: FailureType,
): DailyIncomeAccountingState & ErrorState => ({
  ..._DailyIncomeAccountingState({
    state,
    type: "GetListErrorState",
  }),
  error,
});