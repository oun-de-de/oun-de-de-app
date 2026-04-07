import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import type { InventoryItem } from "@/core/types/inventory";
import type { UpdateStockFormValues } from "../hooks/use-equipment-stock-form";
import { UpdateStockDialog } from "./update-stock-dialog";

vi.mock("@/pages/sale/new/components/filters", () => ({
	ChoiceChips: ({ options, value, onChange }: { options: Array<{ name: string; id: string }>; value: Array<{ name: string }>; onChange: (next: Array<{ name: string; id: string }>) => void }) => (
		<div>
			{options.map((option) => (
				<button
					key={option.id}
					type="button"
					aria-pressed={value.some((selected) => selected.name === option.name)}
					onClick={() => onChange([option])}
				>
					{option.name}
				</button>
			))}
		</div>
	),
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
	quantityOnHand: 10,
	alertThreshold: 2,
};

function renderDialog(props?: {
	isPending?: boolean;
	onSubmit?: (values: UpdateStockFormValues) => Promise<unknown>;
	onOpenChange?: (open: boolean) => void;
	onRegenerateRefCode?: () => void;
}) {
	function TestHarness() {
		const form = useForm<UpdateStockFormValues>({
			defaultValues: {
				quantity: "1",
				reason: "purchase",
				memo: "",
				expense: "",
				refCode: "PUR-001",
				refCodeMode: "auto",
			},
		});

		return (
			<UpdateStockDialog
				item={itemFixture}
				open
				onOpenChange={props?.onOpenChange ?? vi.fn()}
				form={form}
				onRegenerateRefCode={props?.onRegenerateRefCode ?? vi.fn()}
				onSubmit={props?.onSubmit ?? vi.fn().mockResolvedValue(undefined)}
				isPending={props?.isPending}
			/>
		);
	}

	return render(<TestHarness />);
}

describe("UpdateStockDialog", () => {
	it("submits form values and regenerates ref code", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const onRegenerateRefCode = vi.fn();

		renderDialog({ onSubmit, onRegenerateRefCode });

		await user.click(screen.getByTitle("Regenerate code"));
		expect(onRegenerateRefCode).toHaveBeenCalledTimes(1);

		await user.clear(screen.getByLabelText(/Quantity/i));
		await user.type(screen.getByLabelText(/Quantity/i), "3");
		await user.type(screen.getByPlaceholderText("0"), "12");
		await user.type(screen.getByLabelText(/Description/i), " restock ");
		await user.click(screen.getByRole("button", { name: "Update Stock" }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
			expect(onSubmit.mock.calls[0]?.[0]).toEqual({
				quantity: "3",
				reason: "purchase",
				memo: " restock ",
				expense: "12",
				refCode: "PUR-001",
				refCodeMode: "auto",
			});
		});
	});

	it("does not allow closing through dialog close button while pending", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();

		renderDialog({ isPending: true, onOpenChange });

		const closeButtons = screen.getAllByRole("button", { name: "Close" });
		await user.click(closeButtons[0]);

		expect(onOpenChange).not.toHaveBeenCalled();
		expect(screen.getByRole("heading", { name: "Update Stock" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
	});
});
