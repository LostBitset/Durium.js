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
	// Create an <input> element that will be the source for new_todos
	const input = du("input", { value: new_todos.source });
	// When new_todos fires, clear the value attribute of the <input>
	new_todos.subscribe(() => {
		// You should be careful using getElement, actual HTML element
		// doesn't exist until the component is mounted
		// Just make sure it won't be executed immediately
		// In this case we're totally fine
		input.getElement().value = "";
	});
	// Setup the station, and have the layout display it
	// du.div(...) is just a shorthand for du("div", ...)
	return du.div(
		input,
		du("button", { onclick: new_todos.fire }, "Add!"),
		list.of(todos)
	);
}
// Create a component that uses the `todo_list` component
// Remember, they're just functions
function app() {
	return du.div(
		du("h1", "Example App"),
		todo_list()
	);
}
// Mount this new component
du.mount(app, document.body);

