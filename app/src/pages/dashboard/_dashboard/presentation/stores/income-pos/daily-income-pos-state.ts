
import type { BaseState } from "@/types/state";
import { DailyIncomePoint } from "../../../domain/entities/daily-income-point";
import { FilterData } from "../../../domain/entities/filter";

type DailyIncomePosType =
  | "InitialState"
  | "GetListLoadingState"
  | "GetListSuccessState"
  | "GetListErrorState";

export type DailyIncomePosState = BaseState<DailyIncomePosType> & {
  list: DailyIncomePoint[];
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
  list?: DailyIncomePoint[];
  id?: FilterData;
}): DailyIncomePosState => ({
  id: id ?? state.id,
  list: list ?? state.list,
  type,
});