// Durium.js

// A "free observable"
// Once you create one, you describe when it fires and what it fires afterwards
class Station {
	subscribers;
	source;

	constructor() {
		this.subscribers = [];
		this.source = new StationSource();
	}

	fire() {
		let value = this.source.getValue();
		for (const subscriber of this.subscribers) {
			subscriber(value);
		}
	}

	subscribe(subscriber) {
		this.subscribers.push(subscriber);
	}
}

// The source of values for a station
// Just a wrapper around a () => T
class StationSource {
	func;
}

