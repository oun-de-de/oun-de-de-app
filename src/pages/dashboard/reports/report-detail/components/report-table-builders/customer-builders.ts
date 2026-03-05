import type { Customer } from "@/core/types/customer";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";

export function buildCustomerListRows(customers: Customer[]): ReportTemplateRow[] {
	return customers.map((customer, index) => ({
		key: customer.id,
		cells: {
			no: index + 1,
			name: customer.name ?? "-",
			code: customer.code ?? "-",
			phone: customer.telephone ?? "-",
			geography: customer.geography ?? "-",
			address: customer.address ?? "-",
		},
	}));
}
