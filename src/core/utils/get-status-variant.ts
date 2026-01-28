type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "warning" | "error";

/**
 * Maps a status string to a Badge variant.
 * @param status - The status string (case-insensitive).
 * @returns The corresponding Badge variant.
 */
export const getStatusVariant = (status: string): BadgeVariant => {
	const normalizedStatus = status.toLowerCase();

	switch (normalizedStatus) {
		case "active":
		case "approved":
		case "completed":
		case "paid":
		case "returned":
		case "success":
		case "enabled":
			return "success";

		case "pending":
		case "processing":
		case "draft":
		case "waiting":
		case "warning":
			return "warning";

		case "rejected":
		case "failed":
		case "canceled":
		case "blocked":
		case "overdue":
		case "deleted":
		case "error":
		case "critical":
			return "destructive";

		case "info":
		case "new":
			return "info";

		case "inactive":
		case "disabled":
		case "archived":
			return "secondary";

		default:
			return "outline";
	}
};
