// loading-controller.ts
type Listener = (state: LoadingState) => void;

type LoadingState = {
	visible: boolean;
	lockOnly: boolean;
	message?: string;
};

class LoadingOverlayController {
	private state: LoadingState = {
		visible: false,
		lockOnly: false,
	};

	private listeners = new Set<Listener>();

	show(message?: string, lockOnly = false) {
		if (this.state.visible && this.state.message === message) return;
		this.state = { visible: true, lockOnly, message };
		this.emit();
	}

	hide() {
		if (!this.state.visible) return;
		this.state = { visible: false, lockOnly: false, message: undefined };
		this.emit();
	}

	subscribe(listener: Listener) {
		this.listeners.add(listener);

		return () => {
			this.listeners.delete(listener);
		};
	}

	private emit() {
		this.listeners.forEach((l) => l(this.state));
	}
}

export const loadingOverlay = new LoadingOverlayController();
