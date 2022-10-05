// Transpile a FreeGroup HTML file to vanilla HTML/CSS/JS

const fs = require('fs');

import { parse, HTMLElement } from 'node-html-parser';

// << begin helpers >>

function err(msg: string): never {
	throw new Error(msg);
}

function unreachable(): never {
	throw new Error("Unreachable code.");
}

function chunk_array<T>(arr: T[], size: number): T[][] {
	let res = [];
	for (let i = 0; i < arr.length; i += size) {
		let new_chunk = [];
		for (let j = i; j < i + size; j++) {
			new_chunk.push(arr[j]);
		}
		res.push(new_chunk);
	}
	return res;
}

function flatten_array_once<T>(arr: T[][]): T[] {
	let res = [];
	for (const sub of arr) {
		for (const x of sub) {
			res.push(x);
		}
	}
	return res;
}

function empty_to_null(x: string): string | null {
	if (x.length === 0) {
		return null;
	} else {
		return x;
	}
}

function pull_out_nulls<T>(arr: (T | null)[]): T[] | null {
	let res = [];
	for (const x of arr) {
		if (x === null) {
			return null;
		} else {
			res.push(x);
		}
	}
	return res;
}

// << end helpers >>

interface watchexpr {
	name: string;
	impulse: string;
	observe: string | null;
}

function make_script_sources_case(watch_expr: watchexpr, idx: number): String {
	let result;
	let impulse = watch_expr.impulse;
	if (watch_expr.observe === null) {
		result = `
		case "${watch_expr.name}":
			__fggen_elem = document.getElementById("__FGELEM-${idx}");
			__fggen_obj = new FgImpulse();
			__fggen_old_${impulse} = __fggen_elem.${impulse} || (() => {});
			__fggen_elem.${impulse} = () => {
				__fggen_old_${impulse}();
				__fggen_obj.__control.fire();
			};
			return __fggen_obj;
		`;
	} else {
		result = `
		case "${watch_expr.name}":
			__fggen_elem = document.getElementById("__FGELEM-${idx}");
			__fggen_obj = new FgObservable(() => __fggen_elem.${watch_expr.observe});
			__fggen_old_${impulse} = __fggen_elem.${impulse} || (() => {});
			__fggen_elem.${impulse} = () => {
				__fggen_old_${impulse}();
				__fggen_obj.__control.fire();
			};
			return __fggen_obj;
		`;
	}
	return result.trim();
}

function make_script_sources(watch_exprs: watchexpr[]): string {
	let cases = watch_exprs.map(make_script_sources_case);
	return `
	<script id="__FGSCRIPT-fg-sources" class="fg-GENERATED">
	function obs(__fggen_obsname) {
		switch (__fggen_obsname) {
			${cases.join("\n")}
		}
	}
	</script>\n
	`;
}

function parse_watchexprs(str: string): watchexpr[] | null {
	let parts = str.split(" ");
	if (parts.length % 2 !== 0) { return null; }
	let pairs = chunk_array(parts, 2);
	let result = pairs.map(pair => {
		let rhs = pair[1].split("@");
		if (rhs.length !== 2) { return null; }
		return {
			name: pair[0],
			impulse: rhs[1],
			observe: empty_to_null(rhs[0]),
		};
	});
	return pull_out_nulls(result);
}

function transpile(root: HTMLElement): HTMLElement {
	let to_watch = root.querySelectorAll("[watch]");
	let watch_exprs = to_watch.map(
		elem => parse_watchexprs(
			elem.getAttribute("watch") ?? unreachable()
		) ?? err("invalid watch expression")
	);
	to_watch.forEach((elem, idx) => {
		elem.removeAttribute("watch");
		elem.setAttribute("id", `__FGELEM-${idx}`);
	});
	let flow_section = root.querySelectorAll("script.fg-flow");
	let script_sources = make_script_sources(flatten_array_once(watch_exprs));
	flow_section[0].insertAdjacentHTML('beforebegin', script_sources);
	return root;
}

fs.readFile('example.html', 'utf8', (err: string, data: string) => {
	if (err) { return console.log(err); }
	let results = transpile(parse(data)).toString();
	console.log(results);
});

