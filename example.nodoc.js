function clickable_ul() {
	const clicks = new Station();
	return [du.layout(
		du("ul", du.repeat(
			du("li", { onclick: clicks.fireElement }, du.value())
		))
	), clicks];
}

function todo_list() {
	const new_todos = new Station();
	const [list, clicks] = clickable_ul();
	const todos = Station.scanMulti([],
		[new_todos, (s, todo) => [todo, ...s]],
		[clicks, (s, el) => s.filter(x => x !== el.innerText)]
	);
	const input = du("input", { value: new_todos.source });
	new_todos.subscribe(() => { input.getElement().value = ""; });
	return du.div(
		du("h1", "To-do List"),
		input,
		du("button", { onclick: new_todos.fire }, "Add!"),
		list.of(todos)
	);
}
du.mount(todo_list, document.body);

