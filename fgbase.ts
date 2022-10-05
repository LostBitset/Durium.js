// FreeGroup.js classes

class FgObservable<T> {
	private _control: FgObservableControl<T>;

	constructor(control: FgObservableControl<T>) {
		this._control = control;
	}

	static from<T>(access: () => T): FgObservable<T> {
		return new FgObservable(
			new FgObservableControl(access)
		);
	}

	subscribe(subscriber: (x: T) => void): void {
		this._control.subscribe(subscriber);
	}
}

class FgObservableControl<T> {
	readonly access: () => T;
	subscribers: ((x: T) => void)[];

	constructor(access: () => T) {
		this.access = access;
		this.subscribers = [];
	}

	subscribe(subscriber: (x: T) => void): void {
		this.subscribers.push(subscriber);
	}

	fire(): void {
		let value = (this.access)();
		for (const subscriber of this.subscribers) {
			subscriber(value);
		}
	}
}

class FgImpulse {
	private _control: FgImpulseControl;

	constructor(control: FgImpulseControl) {
		this._control = control;
	}

	static impulse(): FgImpulse {
		return new FgImpulse(
			new FgImpulseControl()
		);
	}

	subscribe(subscriber: () => void): void {
		this._control.subscribe(subscriber);
	}
}

class FgImpulseControl {
	subscribers: (() => void)[];

	constructor() {
		this.subscribers = [];
	}

	subscribe(subscriber: () => void): void {
		this.subscribers.push(subscriber);
	}

	fire(): void {
		for (const subscriber of this.subscribers) {
			subscriber();
		}
	}
}

