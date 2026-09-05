export interface QueryStateSlice {
	isLoading?: boolean;
	isError?: boolean;
	refetch?: () => unknown | Promise<unknown>;
}

export function combineQueryStates(...slices: QueryStateSlice[]) {
	return {
		isLoading: slices.some((slice) => slice.isLoading === true),
		isError: slices.some((slice) => slice.isError === true),
		refetch: async () => {
			await Promise.all(slices.filter((slice) => slice.refetch).map((slice) => slice.refetch!()));
		},
	};
}
