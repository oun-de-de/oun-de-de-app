export interface BaseStore<State, Actions> {
	state: State;
	actions: Actions & {
		subscribe?: (state: State, prevState: State) => void;
	};
}
