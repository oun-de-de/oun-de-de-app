import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { type CouponState, CouponInitialState } from "./coupon-state";

type CouponStore = {
	state: CouponState;
	actions: {
		updateState: (payload: Partial<CouponState>) => void;
		resetState: () => void;
	};
};

const useCouponsListStore = create<CouponStore>()(
	devtools(
		(set) => ({
			state: CouponInitialState(),
			actions: {
				updateState: (payload: Partial<CouponState>) =>
					set((s) => ({
						state: { ...s.state, ...payload },
					})),
				resetState: () => set({ state: CouponInitialState() }),
			},
		}),
		{ name: "CouponsListStore" },
	),
);

export const useCouponsList = () => useCouponsListStore((store) => store.state);
export const useCouponsListActions = () => useCouponsListStore((store) => store.actions);
export default useCouponsListStore;
