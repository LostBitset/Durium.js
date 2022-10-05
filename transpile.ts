// Transpile a FreeGroup HTML file to vanilla HTML/CSS/JS

const fs = require('fs');

import { parse, Node } from 'node-html-parser';

function transpile(root: Node): Node {
	return root;
}

fs.readFile('example.html', 'utf8', (err: string, data: string) => {
	if (err) { return console.log(err); }
	let results = transpile(parse(data)).toString();
	console.log(results);
});

