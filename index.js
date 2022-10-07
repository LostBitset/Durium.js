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

// Durium nodes, which are like DOM nodes but allowed to contain layout and layout-internal nodes
// These can be rendered as HTML at any time (ideally only once)
class DuNode {
	attrs;
	inner;

	constructor(attrs, inner) {
		this.attrs = attrs;
		this.inner = inner;
	}

	toHtml() {
		throw new Error('not yet implemented');
	}
}

// Layout nodes, which provide a station for the inner parts to display
class LayoutNode {
	station;
	inner;
	
	constructor(station, inner) {
		this.station = station;
		this.inner = inner;
	}

	toHtml() {
		throw new Error('not yet implemented');
	}
}

// Layout-internal nodes, which go inside a layout (think `du.value()`)
class LayoutIntNode {}

// The actual `du` function object
// By itself (as a function), it is used to create simple HTML elements
var du = function du(tag, ...args) {
	let attrs, inner;
	if (typeof args[0] === "object" && !(args[0].hasOwnProperty("__not_attrs"))) {
		attrs = args[0];
		inner = args.slice(1);
	} else {
		attrs = {};
		inner = args;
	}
	return new DuNode(attrs, inner);
}

