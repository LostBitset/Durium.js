// Transpile a FreeGroup HTML file to vanilla HTML/CSS/JS

const fs = require('fs');

import { parse, HTMLElement } from 'node-html-parser';

function transpile(root: HTMLElement): HTMLElement {
	let to_watch = root.querySelectorAll("[watch]");
	console.log(to_watch.length);
	return root;
}

fs.readFile('example.html', 'utf8', (err: string, data: string) => {
	if (err) { return console.log(err); }
	let results = transpile(parse(data)).toString();
	console.log(results);
});

