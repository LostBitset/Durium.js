// Durium.js

// A "free observable"
// Once you create one, you describe when it fires and what it fires afterwards
class Station {
	static reg = {};
	static next_id_RAW = 0;
	subscribers;
	_source;
	id;

	constructor() {
		this.id = Station.getNextId();
		this.subscribers = [];
		Station.reg[this.id] = this;
	}

	static getNextId() {
		Station.next_id_RAW += 1;
		return Station.next_id_RAW;
	}

	_fire(override) {
		if (override === undefined) {
			value = this._source();
		} else {
			value = override;
		}
		for (const subscriber of this.subscribers) {
			subscriber(value);
		}
	}

	subscribe(subscriber) {
		this.subscribers.push(subscriber);
	}

	get source() {
		return new StationSource(this.id);
	}

	get fire() {
		return new StationFiring(this.id);
	}

	map(transform) {
		let res = new Station();
		res._source = () => {
			return transform(this._source())
		};
		this.subscribe(value => {
			res._fire(transform(value));
		});
		return res;
	}

	proxy() {
		let res = new Station();
		res._source = () => {
			return this._source();
		};
		this.subscribe(value => {
			res._fire(value);
		});
		return res;
	}

	scan(init, update) {
		let res = new Station();
		let state = { __state: init };
		res._source = () => state.__state;
		this.subscribe(value => {
			state.__state = update(state.__state, value);
			res._fire();
		});
		return res;
	}

	history({ reverse = false } = {}) {
		if (reverse) {
			return this.scan([], (state, value) => [value, ...state]);
		} else {
			return this.scan([], (state, value) => [...state, value]);
		}
	}

	static scanMulti(init, ...pairs) {
		let res = new Station();
		let state = { __state: init };
		res._source = () => state.__state;
		for (const [station, update] of pairs) {
			station.subscribe(value => {
				state.__state = update(state.__state, value);
				res._fire();
			})
		}
		return res;
	}

	get fireElement() {
		return new StationElementFiring(this.id);
	}
}

// The source of values for a station
// Just holds the station ID
class StationSource {
	station_id;

	constructor(station_id) {
		this.station_id = station_id;
	}

	bindTo(func) {
		let station = Station.reg[this.station_id];
		station._source = func;
	}

	bindToElementAttribute(id, attr) {
		this.bindTo(() => {
			let el = document.getElementById(id);
			return el[attr];
		});
	}
}

// The firing of values for a station
// Just holds the station ID
class StationFiring {
	station_id;

	constructor(station_id) {
		this.station_id = station_id;
	}

	toJS() {
		let station = `Station.reg[${this.station_id}]`
		return `${station}._fire()`;
	}
}

// Void elements in HTML
const void_elements = [
	'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
	'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

// Durium nodes, which are like DOM nodes but allowed to contain layout and layout-internal nodes
// These can be rendered as HTML at any time (ideally only once)
class DuNode {
	static next_id_RAW = 0;
	tag;
	is_void_element; // tag should be null if is_void_element_is true
	attrs; // A [string, string][]
	inner;
	suffix;
	id;

	constructor(tag, attrs_object, inner) {
		this.tag = tag;
		this.is_void_element = void_elements.includes(tag);
		this.attrs = Object.entries(attrs_object)
		this.inner = inner;
		this.id = null;
	}

	static getNextId() {
		DuNode.next_id_RAW += 1;
		return DuNode.next_id_RAW;
	}

	getHtmlId() {
		return `~du${this.id}`;
	}

	getElement() {
		return document.getElementById(this.getHtmlId());
	}

	toHtmlGivenTransform(transform) {
		this.id = DuNode.getNextId();
		let set_id = this.getHtmlId();
		let attrs_str = this.attrs.map(
			([a, b]) => {
				if (b instanceof StationSource) {
					// This is a side-effect!
					b.bindToElementAttribute(set_id, a);
					return null;
				} else if (b instanceof StationFiring) {
					return [a, b.toJS()];
				} else {
					return [a, b];
				}
			}
		).filter(x => x !== null);
		let attrs_html =
			attrs_str
			.map(([a, b]) => `${a}="${b}"`)
			.join(" ");
		if (set_id !== null) {
			attrs_html += ` id="${set_id}"`;
		}
		let element_html;
		if (this.is_void_element) {
			element_html = `<${this.tag} ${attrs_html}>`;
		} else {
			let inner_html = this.inner.map(
				transform
			).join("");
			element_html = `<${this.tag} ${attrs_html}>${inner_html}</${this.tag}>`;
		}
		return element_html;
	}

	// The normal toHtml function
	toHtml() {
		return this.toHtmlGivenTransform(x => toHtmlFunction(x));
	}

	// You can have a DuNode inside of a layout
	toHtmlGiven(value) {
		return this.toHtmlGivenTransform(x => {
			this.id = DuNode.getNextId();
			return toHtmlGivenFunction(x, value)
		});
	}
}

// Layouts (not yet assigned a station)
class Layout {
	inner;

	constructor(...inner) {
		this.inner = du.div(...inner);
	}

	of(station) {
		return new LayoutNode(station, this.inner);
	}
}

// Layout nodes, which provide a station for the inner parts to display
class LayoutNode {
	station;
	inner;
	id;
	static loaded_stations = {};
	static next_id_RAW = 0;
	
	constructor(station, inner) {
		this.station = station.proxy();
		this.inner = inner;
		this.id = LayoutNode.getNextId();
	}

	static getNextId() {
		this.next_id_RAW += 1;
		return this.next_id_RAW;
	}

	toHtml() {
		let set_id = `du_genLayoutNode-div-${this.id}`;
		let div = `<div id="${set_id}"></div>`;
		this.station.subscribe( // This is a side-effect!
			value => {
				let div_el = document.getElementById(set_id);
				if (div_el !== undefined) {
					div_el.innerHTML = this.inner.toHtmlGiven(value);
				}
			}
		);
		LayoutNode.loaded_stations[this.id] = this.station;
		return div;
	}
}

// Check if an object is a node object
function isNodeObject(obj) {
	return (obj['toHtml'] !== undefined) || (obj['toHtmlGiven'] !== undefined); 
}

// The actual `du` function object
// By itself (as a function), it is used to create simple HTML elements
var du = function du(tag, ...args) {
	let attrs, inner;
	if (typeof args[0] === "object" && !isNodeObject(args[0])) {
		attrs = args[0];
		inner = args.slice(1);
	} else {
		attrs = {};
		inner = args;
	}
	return new DuNode(tag, attrs, inner);
}

// THIS DOESNT ACTUALLY DO ANYTHING RIGHT NOW, I'LL ADD DOMPURIFY SOON
function sanitizeHtml(dirty) {
	return dirty; // NO NO NO NO NO
}

// Layout internal nodes are just objects with the `toHtmlGiven` function
// This takes in the value given to the layout, and converts it into HTML

// Layout-internal node
// Just renders the value as a string
function du_value() {
	return {
		toHtmlGiven: value => {
			return sanitizeHtml(value);
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

// Just toGivenHtml but let's you use strings
function toHtmlGivenFunction(obj, value) {
	if (typeof obj === "string") {
		return sanitizeHtml(obj);
	} else {
		return obj.toHtmlGiven(value);
	}
}

// Just toHtml but let's you use strings
function toHtmlFunction(obj) {
	if (typeof obj === "string") {
		return sanitizeHtml(obj);
	} else {
		return obj.toHtml();
	}
}

// Layout-internal node
// Renders other nodes, with the inner value set to a specific property of the outer value
function du_section(k, ...inner) {
	return {
		toHtmlGiven: value => {
			let inner_converted = inner.map(
				x => toHtmlGivenFunction(x, value[k])
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
					x => toHtmlGivenFunction(x, inner_value)
				)
			);
			return `<div class="du_gen-repeat">${inner_all.join("")}</div>`
		}
	};
}
du.repeat = du_repeat;

// Layout-internal node
// Renders other nodes only if the value is not null
function du_opt(...inner) {
	return {
		toHtmlGiven: value => {
			if (value !== null) {
				let inner_converted = inner.map(
					x => toHtmlGivenFunction(x, value)
				);
				return `<div class="du_gen-opt_nonnull">${inner_converted.join("")}</div>`;
			} else {
				return `<div class="du_gen-opt_null"></div>`
			}
		}
	};
}
du.opt = du_opt;

// Just a shorthand for du("div", ...)
function du_div(...inner) {
	return du("div", ...inner);
}
du.div = du_div;

// Create a Layout object
// Just forwards to the constructor
function du_layout(...inner) {
	return new Layout(...inner);
}
du.layout = du_layout;

// Mount a Durium component
// Durium components are just functions, and in this case, they can't take any arguments
// They must return a valid node (an object with a toHtml function)
// This just forwards to the mount_durium_component function
function du_mount(component, domNode) {
	mount_durium_component(component, domNode);
}
du.mount = du_mount;

// The actual function to mount a Durium component
function mount_durium_component(component, domNode) {
	let topNode = component();
	let div = document.createElement('div');
	domNode.appendChild(div);
	div.innerHTML = topNode.toHtml();
	Object.entries(LayoutNode.loaded_stations).forEach(
		([_, station]) => {
			station._fire();
		}
	);
	LayoutNode.loaded_stations = {};
}

