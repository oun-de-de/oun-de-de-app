import { act, renderHook } from "@testing-library/react";
import { SELECT_NONE_VALUE } from "@/core/constants/form";
import { useCreateItemForm } from "./use-create-item-form";

describe("useCreateItemForm", () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

	it("only auto-fills an initial stock ref code when quantity on hand is greater than zero", () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() => useCreateItemForm({ onSubmit }));

		expect(result.current.form.getValues("refCodeMode")).toBe("auto");

		act(() => {
			result.current.form.setValue("quantityOnHand", 2);
		});

		expect(result.current.form.getValues("refCode")).toMatch(/^INI-\d{8}-\d{6}$/);
	});

	it("clears the ref code when quantity on hand returns to zero", () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() => useCreateItemForm({ onSubmit }));

		act(() => {
			result.current.form.setValue("quantityOnHand", 2);
		});

		expect(result.current.form.getValues("refCode")).toMatch(/^INI-\d{8}-\d{6}$/);

		act(() => {
			result.current.form.setValue("quantityOnHand", 0);
		});

		expect(result.current.form.getValues("refCode")).toBe("");
	});

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
				refCodeMode: "manual",
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

	it("omits init stock when quantity on hand is zero", async () => {
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
				refCodeMode: "auto",
				refCode: "INI-20260423-101530",
				quantityOnHand: 0,
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

	it("regenerates the ref code when requested", () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-23T10:15:30"));
		const { result } = renderHook(() => useCreateItemForm({ onSubmit }));

		act(() => {
			result.current.form.setValue("quantityOnHand", 2);
		});

		const originalRefCode = result.current.form.getValues("refCode");

		vi.setSystemTime(new Date("2026-04-23T10:15:31"));

		act(() => {
			result.current.regenerateRefCode();
		});

		expect(result.current.form.getValues("refCode")).not.toBe(originalRefCode);
		expect(result.current.form.getValues("refCode")).toBe("INI-20260423-101531");
	});
});
