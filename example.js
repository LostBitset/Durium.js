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
// Create a component using that layout and station
const todo_list = du.component(
  du("input", { value: todos.source }),
  du("button", { onclick: todos.fire }, "Add!"),
  list.of(todos)
);
