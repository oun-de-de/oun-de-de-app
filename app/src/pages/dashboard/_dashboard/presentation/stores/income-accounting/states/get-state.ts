import { FailureType } from "@/types/failure";
import { ErrorState, LoadingState } from "@/types/state";
import { DailyIncomeAccountingState, _DailyIncomeAccountingState } from "../daily-income-accounting-state";
import { DailyIncomeAccounting } from "@/pages/dashboard/_dashboard/domain/entities/daily-income";
import { FilterData } from "@/pages/dashboard/_dashboard/domain/entities/filter";

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