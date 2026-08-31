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
		expect(screen.getByText("Report Period")).toBeInTheDocument();
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
			});
		});
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

	it("submits filters with the Enter key", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderSaleDetailFilters({ onSubmit });

		await screen.findByRole("combobox", { name: "Customer Type" });
		screen.getByRole("button", { name: "Submit" }).focus();
		await user.keyboard("{Enter}");

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it("formats single date filter properly without returning 'No date selected'", () => {
		expect(formatFilterRange({ fromDate: "2026-08-19", useDateRange: false })).toBe("19/08/2026");
		expect(formatFilterRange({ fromDate: "2026-08-19", toDate: "2026-08-19", useDateRange: true })).toBe("19/08/2026");
		expect(formatFilterRange({ fromDate: "2026-08-01", toDate: "2026-08-31", useDateRange: true })).toBe(
			"01/08/2026 To 31/08/2026",
		);
		expect(formatFilterRange(undefined)).toBe("No date selected");
	});
});
