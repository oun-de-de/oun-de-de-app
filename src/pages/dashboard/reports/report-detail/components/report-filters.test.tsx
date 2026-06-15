import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import customerService from "@/core/api/services/customer-service";
import type { Customer } from "@/core/types/customer";
import { getSafeAvatarImageUrl, ReportFilters, type ReportFiltersValue } from "./report-filters";

vi.mock("@/core/api/services/customer-service", () => ({
	default: {
		getCustomerList: vi.fn(),
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

const defaultValue: ReportFiltersValue = {
	customerId: "all",
	customerTypeId: "all",
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
	onChange?: (value: ReportFiltersValue) => void;
	onSubmit?: () => void;
}) {
	return render(
		<ReportFilters
			value={props?.value ?? defaultValue}
			onChange={props?.onChange ?? vi.fn()}
			onSubmit={props?.onSubmit ?? vi.fn()}
			onReset={vi.fn()}
			hasPendingChanges={false}
			filterConfig={{ customer: true, customerType: true, dateRange: true }}
			reportSlug="sale-detail-by-customer"
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

	it("updates the selected Customer Type referrer", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		renderSaleDetailFilters({ onChange });

		const customerTypeSelect = await screen.findByRole("combobox", { name: "Customer Type" });
		await user.click(customerTypeSelect);
		await user.click(within(screen.getByRole("listbox")).getByRole("option", { name: "C001 : Referrer Customer" }));

		await waitFor(() => {
			expect(onChange).toHaveBeenCalledWith({
				...defaultValue,
				customerTypeId: "customer-referrer",
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

	it("submits filters with the Enter key", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderSaleDetailFilters({ onSubmit });

		await screen.findByRole("combobox", { name: "Customer Type" });
		screen.getByRole("button", { name: "Submit" }).focus();
		await user.keyboard("{Enter}");

		expect(onSubmit).toHaveBeenCalledTimes(1);
	});
});
