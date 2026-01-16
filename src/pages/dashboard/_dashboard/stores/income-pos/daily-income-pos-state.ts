
import type { BaseState } from "@/core/types/state";
import { DailyIncomePos } from "../../../../../core/domain/dashboard/entities/daily-income";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";

type DailyIncomePosType =
  | "InitialState"
  | "GetListLoadingState"
  | "GetListSuccessState"
  | "GetListErrorState";

export type DailyIncomePosState = BaseState<DailyIncomePosType> & {
  list: DailyIncomePos[];
  id?: FilterData;
};
export const DailyIncomePosInitialState = (
  id?: FilterData,
): DailyIncomePosState => ({
  type: "InitialState",
  list: [],
  id,
});

export const _DailyIncomePostState = ({
  state,
  type,
  list,
  id,
}: {
  state: DailyIncomePosState;
  type: DailyIncomePosType;
  list?: DailyIncomePos[];
  id?: FilterData;
}): DailyIncomePosState => ({
  id: id ?? state.id,
  list: list ?? state.list,
  type,
});