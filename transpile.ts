// Transpile a FreeGroup HTML file to vanilla HTML/CSS/JS

const fs = require('fs');

import { parse } from 'node-html-parser';

function transpile(root) {
	return root;
}

fs.readFile('example.html', 'utf8', (err, data) => {
	if (err) { return console.log(err); }
	let results = transpile(parse(data));
	console.log(results);
});

