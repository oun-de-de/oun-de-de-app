import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateItemDialog } from "./create-item-dialog";

vi.mock("../../settings/hooks/use-settings", () => ({
	useGetUnitList: () => ({ data: [] }),
	useGetSupplierList: () => ({ data: [] }),
}));

describe("CreateItemDialog", () => {
	it("closes and resets after a successful submit", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn().mockResolvedValue(undefined);

		render(<CreateItemDialog onSubmit={onSubmit} />);

		await user.click(screen.getByRole("button", { name: "New Item" }));

		await user.type(screen.getByLabelText(/Name/i), "Brake Pad");
		await user.clear(screen.getByLabelText(/Unit Price/i));
		await user.type(screen.getByLabelText(/Unit Price/i), "10");
		await user.type(screen.getByLabelText(/Ref Code/i), "stock-001");
		await user.clear(screen.getByLabelText(/Qty On Hand/i));
		await user.type(screen.getByLabelText(/Qty On Hand/i), "3");

		await user.click(screen.getByRole("button", { name: "Create Item" }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
			expect(screen.queryByText("Create New Item")).not.toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "New Item" }));

		expect(screen.getByLabelText(/Name/i)).toHaveValue("");
		expect(screen.getByLabelText(/Ref Code/i)).toHaveValue("");
		expect(screen.getByLabelText(/Qty On Hand/i)).toHaveValue(0);
	});

	it("keeps the dialog open and preserves values when submit fails", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn().mockRejectedValue(new Error("request failed"));

		render(<CreateItemDialog onSubmit={onSubmit} />);

		await user.click(screen.getByRole("button", { name: "New Item" }));

		const nameInput = screen.getByLabelText(/Name/i);
		const priceInput = screen.getByLabelText(/Unit Price/i);

		await user.type(nameInput, "Generator");
		await user.clear(priceInput);
		await user.type(priceInput, "250");

		await user.click(screen.getByRole("button", { name: "Create Item" }));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledTimes(1);
			expect(screen.getByText("Create New Item")).toBeInTheDocument();
		});

		expect(nameInput).toHaveValue("Generator");
		expect(priceInput).toHaveValue(250);
	});
});
