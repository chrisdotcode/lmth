lmth
====
lmth is a "type-safe" HTML DSL for JavaScript environments with an emphasis on
"being fast", whatever that means. It can output HTML either as a string, or as
a DOM tree. All text content is also auto-escaped by default, so you don't have
to worry 'bout nuthin' (unless you want to). It's just JavaScript functions all
the way down!

Also, there's no build or compile step for the browser: just drop in
lmth.min.js, and start using it immediately. lmth supports most, if not all
available HTML5 elements[\*][1].

lmth can be considered a spiritual successor to
[pithy](https://github.com/caolan/pithy), and a cousin of sorts to
[hyperscript](https://github.com/dominictarr/hyperscript).

(In case you were curious, the string 'lmth' is 'HTML' backwards).

Usage
-----
lmth is magic, and uses the
[Do What I Mean](https://en.wikipedia.org/wiki/DWIM) paradigm, so it'll
probably work however you try to use it:

```js
	'use strict';
	var l = require('lmth');

	// Quick gist:
	var html = lmth.main({id: 'main'}, [
		lmth.h1(null, 'Hello, world!'),
		lmth.img({src: '/foo.png'})
	]);
	// To a string:
	html.render();
	// => <main id="main"><h1>Hello, world!</h1><img src="/foo.png"></main>

	// To a DOM tree:
	html.toDOM();
```

Usage in the Browser
--------------------
```html
	<!DOCTYPE html>
	<html>
		<head>
			<meta charset="utf-8">
			<!-- One file drop-in! Look ma, no build! -->
			<script src="/path/to/lmth.min.js"></script>
		</head>
		<body>
			<script>
				'use strict';
				var html = lmth.main({id: 'main'}, [
					lmth.h1(null, 'Hello, world!'),
					lmth.img({src: '/foo.png'})
				]);

				document.body.appendChild(html.toDOM());
			</script>
		</body>
	</html>
```

### More Examples Than You'll Probably Ever Need
If you'd like any of these examples to return you a working DOM tree, just call
`.toDOM` instead of `.render`.

```js
	'use strict';
	var l = require('lmth');

	// Basic:
	l.div().render();
	// => <div></div>

	// Ids and classes:
	l.div('#id-name.class-name-1.class-name-2').render();
	// => <div id="id-name" class="class-name-1 class-name-2"></div>

	// Ids, classes and content:
	l.div('#id-name.class-name-1', 'content').render();
	// => <div id="id-name" class="class-name-1">text content</div>

	// Content-only:
	l.div(null, 'content').render();
	// => <div>content</div>

	// Content-only, auto-escaped:
	l.div(null, '<>"\'').render();
	// => <div>&lt;&gt;&quot;&apos;</div>


	// Ids, classes, content and children:
	l.div('#id-name', 'content', [
		l.p(null, 'Hello, world!')
	]).render();
	// => <div id="id-name">content<p>Hello, world!</p></div>

	// Raw strings can be inserted as children:
	l.div([
		'Hi there!',
		l.span('#id-name')
	]).render();
	// => <div>Hi there!<span id="id-name"></span></div>

	// Attribute objects:
	l.div({'data-id': 1, role: 'main'}).render();
	// => <div data-id="1" role="main"></div>
	// Even falsy values are passed-through (and converted into strings):
	l.span({'my-attribute': ''}).render();
	// => <span my-attribute=""></span>
	l.span({'my-attribute': 0}).render();
	// => <span my-attribute="0"></span>

	// Special syntax for classes in an attribute object: they can either
	// be an array of strings, of a space-separated list of strings (N.B.:
	// the `.class-name-1.class-name-2` dot format isn't supported - nor is
	// `#id-name` for ids. Just use the id/class name without that leading
	// '#' or '.' respectively.
	l.button({id: 'signup-button', class: ['btn', 'big-btn']}).render();
	// or
	l.button({id: 'signup-button', class: 'btn big-btn'}).render();
	// => <button id="signup-button" class="btn big-btn"></button>

	// Stylesheets as objects (please prefer using real stylesheets[\*][2]):
	l.div({style: {color: 'blue', 'background-color': 'white'}}, 'Hello, world').render();
	// => <div style="color:blue;background-color:white">Hello, world</div>

	// Boolean attribute support: if a known-boolean attribute from the
	// HTML5 spec is encountered, it is displayed or not displayed based on
	// whether it is `true` or `false`. All other values (including other
	// falsy ones) are passed-through (and converted into strings):
	l.input({autofocus: true}).render();
	// => <input autofocus="autofocus">
	l.input({autofocus: false}).render();
	// => <input>
	l.input({autofocus: 1}).render();
	// => <input autofocus="1">
	l.input({autofocus: ''}).render();
	// => <input autofocus="">

	// Of course, any and all of the above work with content and children.
	// Mix and match 'till your heart's content:
	l.div({id: 'id-name', class: 'class-name-1 class-name-2', style: {'margin-left': '1em'}}, 'content', [
		l.p(null, 'chrisdotcode is pretty cool')
	]).render();
	// => <div id="id-name" class="class-name-1 class-name-2" style="margin-left:1em">content<p>chrisdotcode is pretty cool</p></div>

	// Need more elements? Cool, make your own:
	var mirrorElement = Node.createElement('mirror');
	// Use it just like any other!
	mirrorElement('#hero.centered', 'content').render();
	// <mirror id="hero" class="centered">content</mirror>

	// If your element is self-closing, you can pass that option:
	var mirrorElement = Node.createElement('mirror', {isVoid: true});
	mirrorElement('#hero.centered', 'content').render();
	// <mirror id="hero" class="centered">

	// If you'd like to attach your element to your `lmth` object directly,
	// I'd suggest using `addElement`:
	l.addElement('mirror');
	l.mirror('#hero.centered', 'content').render();
	// <mirror id="hero" class="centered">content</mirror>
```

Install
-------
```bash
	$ npm install lmth
```

Conditionals
------------
It's just JavaScript functions! Just use an `if statement`:

```js
	'use strict';
	var l = require('lmth');

	function getHomePage(isLoggedIn) {
		return (isLoggedIn
			? l.div(null, 'Welcome back!')
			: l.div(null, 'Please log in.')
		).render();
	}

	console.log(getHomePage(true));
	// => <div>Welcome back!</div>
	console.log(getHomePage(false));
	// => <div>Please log in.</div>
```

Iteration
---------
It's just JavaScript functions! Use `.map`s, `.forEach`es, or for loops if you
really, really wanted to:

```js
	'use strict';
	var l = require('lmth');

	var names = [
		'chrisdotcode',
		'Chris Blake',
		'lmth',
		'mirror'
	];

	console.log(
		l.ul(names.map(name => l.li(null, name)))
		.render()
	) 
	// => <ul><li>chrisdotcode</li><li>Chris Blake</li><li>lmth</li><li>mirror</li></ul>
```

Partials
--------
Still just JavaScript functions. Use function composition:

```js
	'use strict';
	var l = require('lmth');

	function layout(title, body) {
		return l.html([
			l.head([ l.title(null, title) ]),
			l.body([
				body,
				l.footer(null, 'By chrisdotcode')
			])
		]).render();
	}

	function pageBody(user) {
		return l.div(null, 'Hi, ' + user.name);
	}

	console.log(layout('User page', pageBody({name: 'Chris Blake'})));
	// => <html><head><title>User page</title></head><body><div>Hi, Chris Blake</div><footer>By chrisdotcode</footer></body></html>
```

Template Recursion
------------------
You get the idea. Use function composition:

```js
	'use strict';
	var l = require('lmth');

	var comments = [
		{
			message: 'First!',
			replies: [
				{
					message: 'Second!',
					replies: []
				}
			]
		},
		{
			message: 'Thanks for posting this!',
			replies: [
				{
					message: 'Thanks for posting \'thanks for posting this!\'!',
					replies: [
						{
							message: 'Thanks for posting thanking for posting \'thanks for posting this!\'!',
							replies: []
						}
					]
				}
			]
		}
	];

	function renderComments(replies) {
		return l.ul(null, replies.map(reply =>
			l.li(null, reply.message, renderComments(reply.replies))
		)).render();
	}

	console.log(renderComments(comments));
	// => XXX
```

Motivation
----------
Manually concating HTML content as strings is painful. Even jQuery gets this
wrong, because you still have to create nodes with string literals, still need
closing tags, and could easily misspell an element's name.

Manually creating DOM elements isn't too fun either. It's too verbose and
generally requires the creation of too many intermediate variables.

[HyperScript](https://github.com/dominictarr/hyperscript) is a step in the
right direction, but still opts for
(string typing)[http://c2.com/cgi/wiki?StringlyTyped]; I want (to get as close
to) all the compile-time errors as I can get, as opposed to silent failures, or
adding new elements on typos (`l.div vs. `h('div')`).

So clearly there's a problem here: we've got no type-safety (as much as you
*can* have types in JavaScript, bear with me), and we're either quick and
dirty, or extremely verbose. lmth takes the straight and narrow: not only is it
easy to work with (if you've read even one of the examples above, you can
probably use 99% of it with no problems), but it also affords you a lot of
convenience with things like automatic DOM node creation and conversion and
HTML escaping.

To formalize, use lmth if you want:

- To not have to think about manually manipulating the DOM
- To not have to work with string munging
- To get runtime errors instead of silent undefined behaviors on typos
	(`l.div` vs. `h('div')`).
- To work on any platform that [UMD](https://github.com/umdjs/umd) supports
	(browsers, Node.js, etc.)
- A one-file, minified drop-in solution that doesn't require a build or compile
	step for browser-like environments
- To not have to worry about HTML escaping
- To be able to leverage the full power of JavaScript in your templates
- To not have to learn another framework, paradigm, etc. lmth is just
	JavaScript functions!
