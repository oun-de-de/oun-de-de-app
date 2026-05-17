export const EMPLOYEE_QUERY_KEYS = {
	all: ["employees"] as const,
	list: () => [...EMPLOYEE_QUERY_KEYS.all, "list"] as const,
};
