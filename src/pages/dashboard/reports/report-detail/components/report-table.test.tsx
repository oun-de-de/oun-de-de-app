import { render, screen } from "@testing-library/react";
import { ReportTable } from "./report-table";
import { useReportTableData } from "./use-report-table-data";

vi.mock("./use-report-table-data", () => ({
	useReportTableData: vi.fn(),
}));

const baseData = {
	definition: { title: "Report", subtitle: "", filterConfig: {}, summaryRows: [], emptyText: "No Data" },
	invoiceIds: [],
	previewRows: [],
	selectedCustomerLabel: undefined,
	selectedCustomer: undefined,
	selectedCustomerTypeLabel: undefined,
	customerTypeCustomerCount: undefined,
	sourceRows: [],
	sortedRows: [{ key: "row-1", cells: { name: "REAL_DATA" } }],
};

describe("ReportTable", () => {
	it("does not render row data while the query is loading", () => {
		vi.mocked(useReportTableData).mockReturnValue({ ...baseData, isLoading: true } as never);

		render(
			<ReportTable
				columns={[{ id: "name", header: "Name", cell: (info) => info.row.original.cells.name }]}
				reportSlug="cash-transaction-report"
			/>,
		);

		expect(screen.queryByText("REAL_DATA")).not.toBeInTheDocument();
	});

	it("renders row data once loading finishes", () => {
		vi.mocked(useReportTableData).mockReturnValue({ ...baseData, isLoading: false } as never);

		render(
			<ReportTable
				columns={[{ id: "name", header: "Name", cell: (info) => info.row.original.cells.name }]}
				reportSlug="cash-transaction-report"
			/>,
		);

		expect(screen.getByText("REAL_DATA")).toBeInTheDocument();
	});
});
