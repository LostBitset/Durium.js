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

// THIS DOESNT ACTUALLY DO ANYTHING RIGHT NOW, ILL ADD DOMPURIFY SOON
function sanitizeHtml(dirty) {
	return dirty; // NO NO NO NO NO
}

// Layout internal nodes are just objects with the `toHtmlGiven` function

// Layout-internal node
// Just renders the value as a string
function du_value() {
	return {
		toHtmlGiven: value => {
			return santizeHtml(value);
		}
	};
}
du.value = du_value;

// Layout-internal node
// Renders a particular property of the value as a string
function du_prop(k) {
	return {
		toHtmlGiven: value => {
			return sanitizeHtml(value[k]);
		}
	};
}
du.prop = du_prop;

// Layout-internal node
// Renders other nodes, with the inner value set to a specific property of the outer value
function du_section(k, ...inner) {
	return {
		toHtmlGiven: value => {
			let inner_converted = inner.map(
				x => x.toGivenHtml(value[k])
			);
			return `<div class="du_gen-section_${k}">${inner_converted.join("")}</div>`;
		}
	};
}
du.section = du_section;

// Layout-internal node
// Renders other nodes over and over again, for each item in a list
// The outer value is a list, and the inner value is the element type
function du_repeat(...inner) {
	return {
		toHtmlGiven: value => {
			let inner_all = value.flatMap(
				inner_value => inner.map(
					x => x.toGivenHtml(inner_value)
				)
			);
			return `<div class="du_gen-repeat">${inner_converted.join("")}</div>`
		}
	};
}
du.repeat = du_repeat;

// Layout-internal node
// Renders other nodes only if the value is not null
function du_opt(...inner) {
	return {
		toHtmlGiven: value => {
			if value !== null {
				let inner_converted = inner.map(
					x => x.toGivenHtml(value)
				);
				return `<div class="du_gen-opt_nonnull">${inner_converted.join("")}</div>`;
			} else {
				return `<div class="du_gen-opt_null"></div>`
			}
		}
	};
}

