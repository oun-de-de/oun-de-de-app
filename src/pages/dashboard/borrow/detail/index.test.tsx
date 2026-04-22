import { render, screen } from "@testing-library/react";

import BorrowDetailPage from "./index";

const pushMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("react-router", () => ({
	useParams: () => ({ id: "loan-1" }),
	useLocation: () => ({ pathname: "/dashboard/loan/loan-1" }),
	useNavigate: () => navigateMock,
}));

vi.mock("@/routes/hooks/use-router", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

vi.mock("@/core/components/common", () => ({
	BackButton: ({ onClick }: { onClick?: () => void }) => (
		<button type="button" onClick={onClick}>
			Back
		</button>
	),
}));

vi.mock("@/core/ui/button", () => ({
	Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock("@/core/ui/badge", () => ({
	Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/core/ui/separator", () => ({
	Separator: () => <hr />,
}));

vi.mock("@/core/ui/typography", () => ({
	Text: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>,
}));

vi.mock("../../reports/components/layout/report-layout", () => ({
	ReportLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../reports/components/layout/report-template-table", () => ({
	ReportTemplateTable: () => <div data-testid="report-template-table" />,
}));

vi.mock("./components/borrow-detail-dialogs", () => ({
	BorrowMoreDialog: () => null,
	CreatePaymentDialog: () => null,
	EditLoanTermsDialog: () => null,
	PostponeDueDateDialog: () => null,
}));

vi.mock("./components/loan-payments-table", () => ({
	LoanPaymentsTable: () => <div data-testid="loan-payments-table" />,
}));

vi.mock("./hooks/use-borrow-detail-dialogs", () => ({
	useBorrowDetailDialogs: () => ({
		isPaymentDialogOpen: false,
		setIsPaymentDialogOpen: vi.fn(),
		shouldUpdateDueDate: false,
		setShouldUpdateDueDate: vi.fn(),
		paymentCode: "",
		setPaymentCodeValue: vi.fn(),
		paymentAmount: "",
		setPaymentAmount: vi.fn(),
		isBorrowMoreDialogOpen: false,
		setIsBorrowMoreDialogOpen: vi.fn(),
		additionalAmount: "",
		setAdditionalAmount: vi.fn(),
		isEditTermsDialogOpen: false,
		setIsEditTermsDialogOpen: vi.fn(),
		isPostponeDialogOpen: false,
		setIsPostponeDialogOpen: vi.fn(),
		installmentAmountInput: "",
		setInstallmentAmountInput: vi.fn(),
		dueWarningDaysInput: "",
		setDueWarningDaysInput: vi.fn(),
		applyGeneratedPaymentCode: vi.fn(),
		openPaymentDialog: vi.fn(),
		openEditTermsDialog: vi.fn(),
		handleCreatePayment: vi.fn(),
		handleBorrowMore: vi.fn(),
		handleUpdateLoanTerms: vi.fn(),
		handlePostponeLoan: vi.fn(),
		resetPaymentDialog: vi.fn(),
		resetBorrowMoreDialog: vi.fn(),
	}),
}));

vi.mock("./hooks/use-borrow-detail", () => ({
	useBorrowDetail: () => ({
		loan: {
			id: "loan-1",
			borrowerName: "Dara",
			borrowerType: "customer",
			principalAmount: 1000,
			paidAmount: 200,
			installmentAmount: 100,
			dueWarningDays: 7,
			startDate: "2025-05-01T00:00:00",
			createdAt: "2025-05-02T10:30:00",
			status: "normal",
			memo: "Customer buying dryer",
		},
		isLoading: false,
		isError: false,
		payments: [],
		currentDue: {
			dueDate: "2025-06-01T00:00:00",
			amount: 100,
		},
		createPayment: vi.fn(),
		isCreatingPayment: false,
		postponeLoan: vi.fn(),
		isPostponing: false,
		extendLoan: vi.fn(),
		isExtendingLoan: false,
		updateLoan: vi.fn(),
		isUpdatingLoan: false,
		isGeneratingPaymentCode: false,
		regeneratePaymentCode: vi.fn(),
	}),
}));

describe("BorrowDetailPage", () => {
	it("shows the loan memo in the information card", () => {
		render(<BorrowDetailPage />);

		expect(screen.getByText("Memo")).toBeInTheDocument();
		expect(screen.getByText("Customer buying dryer")).toBeInTheDocument();
	});
});
