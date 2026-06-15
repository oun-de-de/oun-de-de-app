import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Product } from "@/core/types/product";
import { createDraftWeightRecord } from "../../utils/weight-record-drafts";
import { WeightRecordsBuilder } from "./weight-records-builder";

vi.mock("@/pages/dashboard/settings/hooks/use-settings", () => ({
	useGetUnitList: () => ({
		data: [
			{ id: "unit-kg", name: "kg", descr: "Kilogram", type: "weight" },
			{ id: "unit-block", name: "block", descr: "Block", type: "count" },
		],
	}),
}));

const products: Product[] = [
	{
		id: "product-1",
		name: "Nem Lai Vung",
		refNo: "P001",
		date: "2026-06-10",
		isPackagedByQuantity: true,
		unit: {
			id: "unit-block",
			name: "block",
			descr: "Block",
			type: "count",
		},
		defaultProductSetting: {
			id: "setting-1",
			price: 50,
			quantity: 10,
		},
	},
];

describe("WeightRecordsBuilder", () => {
	beforeAll(() => {
		HTMLElement.prototype.hasPointerCapture ??= vi.fn(() => false);
		HTMLElement.prototype.releasePointerCapture ??= vi.fn();
		HTMLElement.prototype.scrollIntoView ??= vi.fn();
	});

	it("renders unit as a select and updates the selected unit", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const records = [
			createDraftWeightRecord({
				productName: null,
				weight: 900,
				outTime: "2026-06-10T08:00:00.000Z",
			}),
			createDraftWeightRecord({
				productId: "product-1",
				productName: "Nem Lai Vung",
				unit: "kg",
				weight: 1000,
				outTime: "2026-06-10T08:10:00.000Z",
			}),
		];

		render(<WeightRecordsBuilder products={products} records={records} onChange={onChange} />);

		const unitSelects = screen.getAllByRole("combobox", { name: "Unit" });
		expect(unitSelects[1]).toHaveTextContent("kg");

		await user.click(unitSelects[1]);
		const listbox = screen.getByRole("listbox");
		expect(within(listbox).getByRole("option", { name: "block" })).toBeInTheDocument();

		await user.click(within(listbox).getByRole("option", { name: "block" }));

		expect(onChange).toHaveBeenCalledWith([
			records[0],
			{
				...records[1],
				unit: "block",
			},
		]);
	});
});
