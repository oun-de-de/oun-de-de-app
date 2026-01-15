
import type { BaseState } from "@/types/state";
import { DailyIncomeAccounting } from "../../../domain/entities/daily-income";
import { FilterData } from "../../../domain/entities/filter";

type DailyIncomeAccountingType =
  | "InitialState"
  | "GetListLoadingState"
  | "GetListSuccessState"
  | "GetListErrorState";

export type DailyIncomeAccountingState = BaseState<DailyIncomeAccountingType> & {
  list: DailyIncomeAccounting[];
  id?: FilterData;
};
export const DailyIncomeAccountingInitialState = (
  id?: FilterData,
): DailyIncomeAccountingState => ({
  type: "InitialState",
  list: [],
  id,
});

export const _DailyIncomeAccountingState = ({
  state,
  type,
  list,
  id,
}: {
  state: DailyIncomeAccountingState;
  type: DailyIncomeAccountingType;
  list?: DailyIncomeAccounting[];
  id?: FilterData;
}): DailyIncomeAccountingState => ({
  id: id ?? state.id,
  list: list ?? state.list,
  type,
});