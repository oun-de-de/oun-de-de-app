import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import customerService from "@/core/api/services/customer-service";
import productService from "@/core/api/services/product-service";
import type { Customer } from "@/core/types/customer";
import type { Product } from "@/core/types/product";
import { getSafeAvatarImageUrl, ReportFilters, type ReportFiltersValue } from "./report-filters";
import { formatFilterRange } from "./report-table-utils";

vi.mock("@/core/api/services/customer-service", () => ({
	default: {
		getCustomerList: vi.fn(),
	},
}));

vi.mock("@/core/api/services/product-service", () => ({
	default: {
		getProductList: vi.fn(),
	},
}));

const customers: Customer[] = [
	{
		id: "customer-referrer",
		registerDate: "2026-06-01",
		code: "C001",
		name: "Referrer Customer",
		status: true,
		defaultPrice: "0",
		warehouseId: "warehouse-1",
		memo: "",
		profileUrl: "",
		referredBy: undefined,
		shopBannerUrl: "",
		employeeId: "employee-1",
		telephone: "",
		email: "",
		geography: "",
		address: "",
		location: "",
		map: "",
		billingAddress: "",
		deliveryAddress: "",
		vehicles: [],
	},
	{
		id: "customer-child",
		registerDate: "2026-06-02",
		code: "C002",
		name: "Introduced Customer",
		status: true,
		defaultPrice: "0",
		warehouseId: "warehouse-1",
		memo: "",
		profileUrl: "",
		referredBy: "Referrer Customer",
		shopBannerUrl: "",
		employeeId: "employee-1",
		telephone: "",
		email: "",
		geography: "",
		address: "",
		location: "",
		map: "",
		billingAddress: "",
		deliveryAddress: "",
		vehicles: [],
	},
];

const customerWithUnsafeProfileUrl: Customer = {
	...customers[0],
	id: "customer-unsafe-profile",
	name: "Unsafe Profile",
	profileUrl: "javascript:alert(document.domain)",
};

const products: Product[] = [
	{
		id: "product-1",
		name: "Tube Ice",
		date: "2026-06-01",
		refNo: "P001",
		unit: { id: "unit-1", name: "Bag", descr: "", type: "" },
		defaultProductSetting: { id: "setting-1", price: 1, quantity: 1 },
	},
];

const defaultValue: ReportFiltersValue = {
	customerId: "all",
	customerTypeId: "all",
	productName: "all",
	fromDate: "2026-06-01",
	toDate: "2026-06-10",
	useDateRange: true,
};

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: Infinity,
			},
		},
	});

	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

function renderSaleDetailFilters(props?: {
	value?: ReportFiltersValue;
	onSubmit?: (value: ReportFiltersValue) => void;
}) {
	return render(
		<ReportFilters
			value={props?.value ?? defaultValue}
			onSubmit={props?.onSubmit ?? vi.fn()}
			filterConfig={{ customer: true, customerType: true, dateRange: true }}
			reportSlug="sale-detail-by-customer"
		/>,
		{ wrapper: createWrapper() },
	);
}

function renderOpenInvoiceFilters(
	reportSlug: "open-invoice-detail-by-customer" | "open-invoice-on-period-by-group",
	onSubmit = vi.fn(),
) {
	return render(
		<ReportFilters
			value={defaultValue}
			onSubmit={onSubmit}
			filterConfig={{ customer: true, dateRange: true }}
			reportSlug={reportSlug}
		/>,
		{ wrapper: createWrapper() },
	);
}

describe("ReportFilters", () => {
	beforeAll(() => {
		HTMLElement.prototype.hasPointerCapture ??= vi.fn(() => false);
		HTMLElement.prototype.releasePointerCapture ??= vi.fn();
		HTMLElement.prototype.scrollIntoView ??= vi.fn();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(customerService.getCustomerList).mockResolvedValue({
			list: customers,
			page: 1,
			pageSize: 10000,
			total: customers.length,
			pageCount: 1,
		});
		vi.mocked(productService.getProductList).mockResolvedValue(products);
	});

	it("matches the Rabbit sale-detail filter order with Customer Type before Customer", async () => {
		renderSaleDetailFilters();

		await screen.findByRole("combobox", { name: "Customer Type" });

		const geography = screen.getByText("Geography");
		const customerType = screen.getByText("Customer Type");
		const location = screen.getByText("Location");
		const customer = screen.getByText("Customer");
		const reportPeriod = screen.getByText("Report Period");

		expect(geography.compareDocumentPosition(customerType) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(customerType.compareDocumentPosition(location) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(location.compareDocumentPosition(customer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(reportPeriod).toBeInTheDocument();
	});

	it("renders and submits the Open Invoice detail filters", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderOpenInvoiceFilters("open-invoice-detail-by-customer", onSubmit);

		expect(await screen.findByText("Job")).toBeInTheDocument();
		expect(screen.getByText("Report Date")).toBeInTheDocument();
		expect(screen.getByText("Show Detail")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Submit" }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValue));
	});

	it("uses Group and Report Period date range for Open Invoice by group", async () => {
		renderOpenInvoiceFilters("open-invoice-on-period-by-group");

		expect(await screen.findByText("Group")).toBeInTheDocument();
		expect(screen.queryByText("Job")).not.toBeInTheDocument();
		expect(screen.getByText("Report Period")).toBeInTheDocument();
	});

	it("submits the selected Customer Type referrer", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderSaleDetailFilters({ onSubmit });

		const customerTypeSelect = await screen.findByRole("combobox", {
			name: "Customer Type",
		});
		await user.click(customerTypeSelect);
		await user.click(
			within(screen.getByRole("listbox")).getByRole("option", {
				name: "C001 : Referrer Customer",
			}),
		);

		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({
				...defaultValue,
				customerTypeId: "customer-referrer",
				// Changing the type resets the dependent Customer filter back to All.
				customerId: "all",
			});
		});
	});

	it("limits Customer options to the selected Customer Type", async () => {
		const user = userEvent.setup();
		renderSaleDetailFilters();

		const customerTypeSelect = await screen.findByRole("combobox", {
			name: "Customer Type",
		});
		await user.click(customerTypeSelect);
		await user.click(
			within(screen.getByRole("listbox")).getByRole("option", {
				name: "C001 : Referrer Customer",
			}),
		);

		await user.click(screen.getByRole("combobox", { name: "Customer" }));
		const customerOptions = within(screen.getByRole("listbox")).getAllByRole("option");
		const customerOptionNames = customerOptions.map((option) => option.textContent);
		// Matches existing matchesCustomerType semantics: customers referred by the
		// selected type, not the referrer itself.
		expect(customerOptionNames).toEqual(["All", "C002 : Introduced Customer"]);
	});

	it("submits the selected Product by product name", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderSaleDetailFilters({ onSubmit });

		const productSelect = await screen.findByRole("combobox", {
			name: "Product",
		});
		await user.click(productSelect);
		await user.click(
			within(screen.getByRole("listbox")).getByRole("option", {
				name: "Tube Ice",
			}),
		);

		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({
				...defaultValue,
				productName: "Tube Ice",
			});
		});
	});

	it("does not render unsafe customer profile image URLs", async () => {
		expect(getSafeAvatarImageUrl(customerWithUnsafeProfileUrl.profileUrl)).toBeUndefined();
		expect(getSafeAvatarImageUrl("data:image/svg+xml,<svg onload=alert(1)>")).toBeUndefined();
		expect(getSafeAvatarImageUrl("https://example.com/avatar.png")).toBe("https://example.com/avatar.png");
	});

	it("disables static unsupported promotion and item summary checkboxes", async () => {
		renderSaleDetailFilters();

		expect(await screen.findByLabelText("Chargeable")).toBeDisabled();
		expect(screen.getByLabelText("Free Item")).toBeDisabled();
		expect(screen.getByLabelText("Item Summary")).toBeDisabled();
	});

	it("renders Cash Transaction Report filters without Group By", async () => {
		render(
			<ReportFilters
				value={defaultValue}
				onSubmit={vi.fn()}
				filterConfig={{ customer: false, dateRange: true }}
				reportSlug="cash-transaction-report"
			/>,
			{ wrapper: createWrapper() },
		);

		expect(await screen.findByText("Journal type")).toBeInTheDocument();
		expect(screen.getByText("Chart of account")).toBeInTheDocument();
		expect(screen.queryByText("Group By")).not.toBeInTheDocument();
		expect(screen.queryByText("Group by")).not.toBeInTheDocument();
	});

	it("gives Cash Transaction Report a report period matching its dateRange filterConfig", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(
			<ReportFilters
				value={defaultValue}
				onSubmit={onSubmit}
				filterConfig={{ customer: false, dateRange: true }}
				reportSlug="cash-transaction-report"
			/>,
			{ wrapper: createWrapper() },
		);

		expect(await screen.findByText("Report Period")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /01\/06\/2026/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /10\/06\/2026/ })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(defaultValue));
	});

	it("disables filter controls that no query reads", async () => {
		renderSaleDetailFilters();

		// Employee and the static placeholder selects feed nothing; Customer stays live.
		expect(await screen.findByRole("combobox", { name: "Employee" })).toBeDisabled();
		expect(screen.getByRole("combobox", { name: "Customer" })).not.toBeDisabled();
		expect(screen.getByRole("combobox", { name: "Product" })).not.toBeDisabled();
	});

	it("disables Product for receipt-detail, which reads /payments and ignores productName", async () => {
		render(
			<ReportFilters
				value={defaultValue}
				onSubmit={vi.fn()}
				filterConfig={{ customer: true, customerType: true, dateRange: true }}
				reportSlug="receipt-detail-by-customer"
			/>,
			{ wrapper: createWrapper() },
		);

		expect(await screen.findByRole("combobox", { name: "Product" })).toBeDisabled();
	});

	it("submits filters with the Enter key", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderSaleDetailFilters({ onSubmit });

		await screen.findByRole("combobox", { name: "Customer Type" });
		screen.getByRole("button", { name: "Submit" }).focus();
		await user.keyboard("{Enter}");

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("keeps the picked date when the same day is clicked again", async () => {
		const user = userEvent.setup();
		// Start on a date inside the month the calendar opens on, so the selected day is on screen.
		const today = new Date();
		const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-15`;
		const display = `15/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
		renderSaleDetailFilters({ value: { ...defaultValue, fromDate: iso } });

		await user.click(await screen.findByRole("button", { name: new RegExp(display) }));

		// react-day-picker's single mode toggles: clicking the selected day reports undefined.
		// Treating that as "clear" wiped a required filter and blocked Submit.
		const selectedDay = document.querySelector(
			'[role="dialog"] .rdp-day_selected, [role="dialog"] [aria-selected="true"]',
		);
		expect(selectedDay).not.toBeNull();
		await user.click(selectedDay as HTMLElement);

		expect(screen.getByRole("button", { name: new RegExp(display) })).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Select date" })).not.toBeInTheDocument();
	});

	it("DefaultReportFilterForm limits Customer options to selected Customer Type and resets customerId", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(
			<ReportFilters
				value={{ ...defaultValue, customerId: "customer-child" }}
				onSubmit={onSubmit}
				filterConfig={{ customer: true, customerType: true, dateRange: true }}
				reportSlug="custom-report"
			/>,
			{ wrapper: createWrapper() },
		);

		const customerTypeSelect = await screen.findByRole("combobox", {
			name: "Customer Type",
		});
		await user.click(customerTypeSelect);
		await user.click(
			within(screen.getByRole("listbox")).getByRole("option", {
				name: "C001 : Referrer Customer",
			}),
		);

		// Changing customerType should have reset customerId to "all"
		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					customerTypeId: "customer-referrer",
					customerId: "all",
				}),
			);
		});

		// And Customer dropdown options are filtered
		await user.click(screen.getByRole("combobox", { name: "Customer" }));
		const customerOptions = within(screen.getByRole("listbox")).getAllByRole("option");
		const customerOptionNames = customerOptions.map((option) => option.textContent);
		expect(customerOptionNames).toEqual(["All", "C002 : Introduced Customer"]);
	});

	it("formats single date filter properly without returning 'No date selected'", () => {
		expect(formatFilterRange({ fromDate: "2026-08-19", useDateRange: false })).toBe("19/08/2026");
		expect(formatFilterRange({ fromDate: "2026-08-19", toDate: "2026-08-19", useDateRange: true })).toBe("19/08/2026");
		expect(formatFilterRange({ fromDate: "2026-08-01", toDate: "2026-08-31", useDateRange: true })).toBe(
			"01/08/2026 To 31/08/2026",
		);
		expect(formatFilterRange(undefined)).toBe("No date selected");
	});

	it("allows typing to search and filter options in Open Invoice comboboxes", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderOpenInvoiceFilters("open-invoice-detail-by-customer", onSubmit);

		// Test Branch combobox typing filter
		const branchInput = await screen.findByRole("combobox", { name: "Branch" });
		await user.click(branchInput);
		const listbox = await screen.findByRole("listbox", { name: "Branch" });
		expect(within(listbox).getByRole("option", { name: "01 : ភ្នំពេញ" })).toBeInTheDocument();
		expect(within(listbox).getByRole("option", { name: "All" })).toBeInTheDocument();

		await user.type(branchInput, "01");
		const updatedListbox = await screen.findByRole("listbox", { name: "Branch" });
		expect(within(updatedListbox).getByRole("option", { name: "01 : ភ្នំពេញ" })).toBeInTheDocument();

		await user.click(within(updatedListbox).getByRole("option", { name: "01 : ភ្នំពេញ" }));

		// Test Customer combobox search
		const customerInput = screen.getByRole("combobox", { name: "Customer" });
		await user.click(customerInput);
		const customerListbox = screen.getByRole("listbox", { name: "Customer" });
		expect(within(customerListbox).getByRole("option", { name: "C001 : Referrer Customer" })).toBeInTheDocument();
		expect(within(customerListbox).getByRole("option", { name: "C002 : Introduced Customer" })).toBeInTheDocument();

		await user.clear(customerInput);
		await user.type(customerInput, "Introduced");
		const updatedCustomerListbox = await screen.findByRole("listbox", { name: "Customer" });
		expect(
			within(updatedCustomerListbox).queryByRole("option", { name: "C001 : Referrer Customer" }),
		).not.toBeInTheDocument();
		expect(
			within(updatedCustomerListbox).getByRole("option", { name: "C002 : Introduced Customer" }),
		).toBeInTheDocument();

		await user.click(within(updatedCustomerListbox).getByRole("option", { name: "C002 : Introduced Customer" }));

		// Submit and verify
		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					branchId: "01",
					customerId: "customer-child",
				}),
			);
		});
	});

	it("allows clearing a selected branch using the clear button", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		render(
			<ReportFilters
				value={{ ...defaultValue, branchId: "01" }}
				onSubmit={onSubmit}
				filterConfig={{ customer: true, dateRange: false, singleDate: true }}
				reportSlug="open-invoice-detail-by-customer"
			/>,
			{ wrapper: createWrapper() },
		);

		const clearBtn = await screen.findByRole("button", { name: "Clear Branch" });
		await user.click(clearBtn);

		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					branchId: "all",
				}),
			);
		});
	});
});
