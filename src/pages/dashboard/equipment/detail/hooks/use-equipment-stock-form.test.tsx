import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import type { InventoryItem } from "@/core/types/inventory";
import { useEquipmentStockForm } from "./use-equipment-stock-form";

const mutateAsync = vi.fn();

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
		warning: vi.fn(),
	},
}));

vi.mock("../../hooks/use-inventory-mutations", () => ({
	useUpdateStock: () => ({
		mutateAsync,
		isPending: false,
	}),
}));

const itemFixture: InventoryItem = {
	id: "item-1",
	code: "INV-001",
	name: "Generator",
	type: "EQUIPMENT",
	unit: {
		id: "unit-1",
		name: "pcs",
		descr: "",
		type: "COUNT",
	},
	unitPrice: 100,
	quantityOnHand: 2,
	alertThreshold: 5,
};

describe("useEquipmentStockForm", () => {
	beforeEach(() => {
		mutateAsync.mockReset();
		vi.mocked(toast.warning).mockReset();
		vi.stubGlobal("crypto", {
			randomUUID: () => "abc12345-0000-0000-0000-000000000000",
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("generates an automatic reference code on mount", async () => {
		const { result } = renderHook(() => useEquipmentStockForm(itemFixture));

		await waitFor(() => {
			const refCode = result.current.form.getValues("refCode");
			expect(refCode).toMatch(/^PUR-\d{8}-\d{6}$/);
		});
	});

	it("submits trimmed payload, warns on low stock, and resets form on success", async () => {
		mutateAsync.mockResolvedValue(undefined);
		const { result } = renderHook(() => useEquipmentStockForm(itemFixture));

		await act(async () => {
			await result.current.submit({
				quantity: "3",
				reason: "sold",
				memo: "Sold to customer",
				expense: "0",
				refCode: " SLD-001 ",
				refCodeMode: "manual",
			});
		});

		expect(mutateAsync).toHaveBeenCalledWith({
			refCode: "SLD-001",
			quantity: 3,
			reason: "sold",
			memo: "Sold to customer",
		});
		expect(toast.warning).toHaveBeenCalledWith("Stock is below threshold (-1 < 5) for Generator.");
		expect(result.current.form.getValues("quantity")).toBe("1");
		expect(result.current.form.getValues("reason")).toBe("purchase");
		expect(result.current.form.getValues("expense")).toBe("");
	});

	it("rethrows when stock update fails", async () => {
		const error = new Error("request failed");
		mutateAsync.mockRejectedValue(error);
		const { result } = renderHook(() => useEquipmentStockForm(itemFixture));

		await expect(
			result.current.submit({
				quantity: "2",
				reason: "purchase",
				memo: "",
				expense: "",
				refCode: "PUR-001",
				refCodeMode: "manual",
			}),
		).rejects.toThrow("request failed");
	});

	it("does not include expense in payload for consume reason", async () => {
		mutateAsync.mockResolvedValue(undefined);
		const { result } = renderHook(() => useEquipmentStockForm(itemFixture));

		await act(async () => {
			await result.current.submit({
				quantity: "2",
				reason: "consume",
				memo: "Consumed in maintenance",
				expense: "25",
				refCode: "CON-001",
				refCodeMode: "manual",
			});
		});

		expect(mutateAsync).toHaveBeenCalledWith({
			refCode: "CON-001",
			quantity: 2,
			reason: "consume",
			memo: "Consumed in maintenance",
		});
	});
});
