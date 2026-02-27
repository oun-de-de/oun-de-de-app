import { format, parseISO } from "date-fns";

export function formatDateTime(value: string) {
	return format(parseISO(value), "dd/MM/yyyy HH:mm");
}
