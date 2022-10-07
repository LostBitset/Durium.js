const todos = new Station();
const todo_list = fg.layout(
	fg("ul", fg.repeat(
		fg("li", fg.value())
	))
);
const component = fg.component(
	fg("input", { value: todos.source }),
	fg("button", { onclick: todos.fire }),
	todo_list.instantiate(todos)
);
component.mount();

