# Durium.js
A Mithril-like web framework built on observables

First, Durium is built around *stations*, which can be thought of as "free observables". Anyone with access to a `Station` object can control the source of it's values (through `station.source`), or cause it to emit one of those values (by calling `station.fire()`). 

A Durium component is just fancy HTML, but with three unique abilities:
1. The ability to bind attributes to the source of stations
2. The ability to bind events to the firing of stations
3. The ability to contain *layouts*

The first two allow stations to be defined in terms of the state of the DOM. That might look something like this:
```js
const todos = new Station();
const component = du.component(
	du("input", { value: todos.source }),          // When `todos` fires, it will send the value attribute
	du("button", { onclick: todos.fire }, "Add!")  // When the button is clicked, `todos` will fire
);
```

Here, `todos` will emit new todos as they are created. This is cool, but we want to see all of the todos created so far, not just the last one. Remember, stations are just observables, so we should be able to transform them somehow. Here, we can use the builtin method `.history()`.

```js
const all_todos = todos.history();
// If you think this is cheating, the same thing is possible with the `scan` method as:
const all_todos = todos.scan( (a, b) => [...a, b] );
```

We still need someway for information from stations to make it back to the user. This where Durium takes an unconvential approach, and introduces *layouts*.

A layout is just a function that converts some value to HTML. Normally, these would be called views, and look something like:
```js
// This API doesn't actually exist, it's just for demonstration purposes
du.view(
	du("ul", du.for(
		"todo in all_todos",
		du("li", du.var("todo"))
	))
)
```

This is nice and declarative, but it isn't reusable, it's specific to `all_todos`. Layouts are more generic than views. The view version above described how to render `all_todos`. A layout would describe how to render any `String[]`:
```js
// This does exist :)
const list = du.layout(
	du("ul", fg.repeat(
		du("li", fg.value())
	))
);
```

Woah, where did the variables go!?

Think about it. The `du.value()` bit can render a `String`, and `du.repeat(...)` can render a list of the stuff inside. This can render a `String[]`.


Now, we can add the layout to our component:
```js
const component = du.component(
	du("input", { value: todos.source }),          // When `todos` fires, it will send the value attribute
	du("button", { onclick: todos.fire }, "Add!")  // When the button is clicked, `todos` will fire
	list.of(all_todos)
);
```
