import type { InventoryBorrowing } from "@/core/types/inventory";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { BorrowingsTable } from "./borrowings-table";

type BorrowingsHistoryDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	borrowings: InventoryBorrowing[];
	page: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	onSell: (borrowingId: string) => void;
	onReturn: (borrowingId: string) => void;
	isSellPending?: boolean;
	isReturnPending?: boolean;
};

export function BorrowingsHistoryDialog({
	open,
	onOpenChange,
	borrowings,
	page,
	pageSize,
	onPageChange,
	onPageSizeChange,
	onSell,
	onReturn,
	isSellPending,
	isReturnPending,
}: BorrowingsHistoryDialogProps) {
	const totalPages = Math.max(1, Math.ceil(borrowings.length / pageSize));
	const pagedBorrowings = borrowings.slice((page - 1) * pageSize, page * pageSize);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-6xl">
				<DialogHeader>
					<DialogTitle>Borrowing History</DialogTitle>
				</DialogHeader>
				<BorrowingsTable
					borrowings={pagedBorrowings}
					className="rounded-md border border-slate-200 pb-2"
					maxBodyHeight="60vh"
					onSell={onSell}
					onReturn={onReturn}
					isSellPending={isSellPending}
					isReturnPending={isReturnPending}
					paginationConfig={{
						page,
						pageSize,
						totalItems: borrowings.length,
						totalPages,
						paginationItems: Array.from({ length: totalPages }, (_, index) => index + 1),
						onPageChange,
						onPageSizeChange,
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
