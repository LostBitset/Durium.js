// Components are just functions
function todo_list() {
	// Create a station that sends out new todos
	const new_todos = new Station();
	// Create a new station that sends out the current list of todos
	const todos = new_todos.history();
	// Create a layout the displays a list as an HTML <ul>
	const list = du.layout(
		du("ul", du.repeat(
			du("li", du.value())
		))
	);
	// Setup the station, and have the layout display it
	// du.t(...) is just shorthand for du("template", ...)
	// Read it as if it was a regex, it can be pronounced "duct", "duet", or "dust"
	return du.t(
	  du("input", { value: todos.source }),
	  du("button", { onclick: todos.fire }, "Add!"),
	  list.of(todos)
	);
}
// Create a component that uses the `todo_list` component
// Remember, they're just functions
function app() {
	return du.t(
		du("h1", "Example App"),
		todo_list()
	);
}
// Mount this new component
du.mount(app, document.body);

