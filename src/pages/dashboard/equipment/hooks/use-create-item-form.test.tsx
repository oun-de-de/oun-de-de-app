import { act, renderHook } from "@testing-library/react";
import { SELECT_NONE_VALUE } from "@/core/constants/form";
import { useCreateItemForm } from "./use-create-item-form";

describe("useCreateItemForm", () => {
	it("maps optional fields and defaults alert threshold on submit", async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() => useCreateItemForm({ onSubmit }));

		await act(async () => {
			await result.current.submit({
				name: "  Brake Pad  ",
				type: "consumable",
				unitId: SELECT_NONE_VALUE,
				supplierId: "supplier-1",
				unitPrice: 12.5,
				alertThreshold: undefined,
				refCode: "  stock-001  ",
				quantityOnHand: 3,
			});
		});

		expect(onSubmit).toHaveBeenCalledWith({
			name: "Brake Pad",
			type: "consumable",
			supplierId: "supplier-1",
			unitPrice: 12.5,
			initStock: {
				refCode: "stock-001",
				quantityOnHand: 3,
			},
			alertThreshold: 1,
		});
	});

	it("omits init stock when ref code is blank", async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() => useCreateItemForm({ onSubmit }));

		await act(async () => {
			await result.current.submit({
				name: "Generator",
				type: "equipment",
				unitId: "unit-1",
				supplierId: undefined,
				unitPrice: 250,
				alertThreshold: 2,
				refCode: "   ",
				quantityOnHand: 99,
			});
		});

		expect(onSubmit).toHaveBeenCalledWith({
			name: "Generator",
			type: "equipment",
			unitId: "unit-1",
			unitPrice: 250,
			alertThreshold: 2,
		});
	});
});
