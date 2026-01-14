import { FailureType } from "@/types/failure";
import { ErrorState } from "@/types/state";
import { DailyIncomePosState, DailyIncomePosType, _DailyIncomePostState } from "../daily-income-pos-state";
import { FilterRangeId } from "@/pages/dashboard/_dashboard/domain/entities/filter";
import { DailyIncomePoint } from "@/pages/dashboard/_dashboard/domain/entities/daily-income-point";

export interface DailyIncomePosLoadFirstErrorState extends DailyIncomePosState, ErrorState {}

export const DailyIncomePosLoadFirstLoadingState = (
  state: DailyIncomePosState,
  id: FilterRangeId,
): DailyIncomePosState =>
    _DailyIncomePostState(state, DailyIncomePosType.GetListLoading, state.list, id);

export const DailyIncomePosLoadFirstSuccessState = (
  state: DailyIncomePosState,
  list: DailyIncomePoint[],
) : DailyIncomePosState => _DailyIncomePostState(state, DailyIncomePosType.GetListSuccess
    , list);

export const DailyIncomePosLoadFirstErrorState = (
  state: DailyIncomePosState,
  error: FailureType
): DailyIncomePosLoadFirstErrorState => ({
  ..._DailyIncomePostState(state, DailyIncomePosType.GetListError),
  error,
});
