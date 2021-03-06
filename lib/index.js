// https://github.com/chrisdotcode/lmth
;(function(root, factory) {
	/* https://github.com/umdjs/umd/blob/master/templates/returnExports.js */
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.lmth = factory();
  }
}(this, function() {

'use strict';

function Node(name, isVoid, id, class_, style, listeners, attributes, content, children) {
	if (!(this instanceof Node)) {
		throw new Error("Uh-oh. You're creating a new Node without using the `new` keyword. This isn't allowed because Bad Stuff happens when you do that. What you more than likely want is one of the element functions attached to the Node object like so: `lmth.div(...)`. If you actually did want to create a plain node, you should use `Node.new(name, isVoid, id, class, style, listeners, attributes, content, children)` and avoid the manual constructor call with `new` where possible. If you really, really, really did want to create a node with `new`, you can do so like this: `new Node(name, isVoid, class, style, listeners, attributes, content, children)`.");
	}

	this.name       = name;
	this.isVoid     = isVoid;
	this.id         = id;
	this.class      = class_;
	this.style      = style;
	this.listeners  = listeners;
	this.attributes = attributes;
	this.content    = content;
	// Merge child nodes with arrays of child nodes.
	this.children   = children.reduce(function concatChild(children_, child) {
		return children_.concat(child);
	}, []);

	return this;
}

Node.prototype.toString = function toString() {
	return JSON.stringify(this);
};

Node.new = function new_(name, isVoid, id, class_, style, listeners, attributes, content, children) {
	return new Node(name, isVoid, id, class_, style, listeners, attributes, content, children);
};

/* 'Primitive' defined here is a strict subset of all actual JavaScript
 * primitives. Primitives, in our case are either `string`s, `number`s, or
 * `bool`s. */
function isPrimitive(x) {
	var type = typeof(x);

	if (type === 'bool' || type === 'number' || type === 'string') {
		return true;
	} else {
		return false;
	}

}

function isObject(x) {
	return toString.call(x) === '[object Object]';
}

function typeOf(x) {
	if (isPrimitive(x)) {
		return 'primitive';
	} else if (isObject(x)) {
		return 'object';
	} else if (Array.isArray(x)) {
		return 'array';
	}
}

function isString(x) {
	return toString.call(x) === '[object String]';
}

function addListener(event, listener, nodeListeners) {
	var eventListeners = nodeListeners[event];

	if (!eventListeners) {
		// Coerce the listener into an array of listeners if it isn't
		// already one.
		nodeListeners[event] = [].concat(listener);
	} else {
		eventListeners.push(listener);
	}
}

/* Takes either a list of classes and attributes as a string, or a hash of
 * attributes and normalizes them into the format used when creating new Nodes.
 * */
function parseAttributes(attributes) {
	var nodeAttributes = {
		id   :     null,
		class:     [],
		style:     null,
		listeners: {},
	};

	if (isString(attributes)) {
		var selectors = attributes.split(/([#\.][^#\.]+)/);

		selectors.forEach(function addSelector(selector) {
			if (selector.startsWith('#')) {
				// According to the spec, only one id is
				// allowed, so any newer one overrides an older
				// one.
				nodeAttributes.id = selector.substring(1);
			} else if (selector.startsWith('.')) {
				nodeAttributes.class.push(selector.substring(1));
			}
		});
	} else if (isObject(attributes)) {
		Object.keys(attributes).forEach(function addAttribute(attribute) {
			var property = attributes[attribute];

			if (attribute.startsWith('on') &&
				(typeof(property) === 'function' || Array.isArray(property))) {
				addListener(attribute.slice(2), property, nodeAttributes.listeners);
			} else {
				nodeAttributes[attribute] = property;
			}
		});

		// `node.class` is always an array, so if we're a string, we
		// split on spaces, like how classes are specified when
		// creating HTML strings, or if we're a non-array, non-string
		// value, we wrap ourselves into single-element array.
		if (isString(nodeAttributes.class)) {
			nodeAttributes.class = nodeAttributes.class.split(' ');
		} else if (!Array.isArray(nodeAttributes.class)) {
			nodeAttributes.class = [nodeAttributes.class];
		}

	}

	return nodeAttributes;
}

/* Returns a function that creates an element node with the given name. */
Node.createElement = function createElement(name, options) {
	var isVoid = options.isVoid || false;

	return function newElement(one, two, three) {
		var content    = '';
		var attributes = {};
		var children   = [];

		var typeOfOne = typeOf(one);
		var typeOfTwo = typeOf(two);

		if (isString(one) || typeOfOne === 'object') {
			attributes = one;
		} else if (typeOfOne === 'array') {
			children = one;
		}

		if (typeOfTwo === 'primitive') {
			content = two;
		} else if (typeOfTwo === 'object') {
			attributes = two;
		} else if (typeOfTwo === 'array') {
			children = two;
		}

		if (typeOf(three) === 'array') {
			children = three;
		}

		var nodeAttributes = parseAttributes(attributes);
		var id             = nodeAttributes.id;
		var class_         = nodeAttributes.class;
		var style          = nodeAttributes.style;
		var listeners      = nodeAttributes.listeners;
		delete nodeAttributes.id;
		delete nodeAttributes.class;
		delete nodeAttributes.style;
		delete nodeAttributes.listeners;

		return Node.new(name, isVoid, id, class_, style, listeners, nodeAttributes, content, children);
	}
};

Node.addElement = function addElement(name, options) {
	Node[name] = Node.createElement(name, options);
};

Node.elements = [
	"a", "abbr", "acronym", "address", "applet", "article", "aside",
	"audio", "b", "basefont", "bdi", "bdo", "bgsound", "big", "blink",
	"blockquote", "body", "button", "canvas", "caption", "center", "cite",
	"code", "colgroup", "command", "content", "data", "datalist", "dd",
	"del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element",
	"em", "fieldset", "figcaption", "figure", "font", "footer", "form",
	"frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head",
	"header", "hgroup", "html", "i", "iframe", "image", "ins", "isindex",
	"kbd", "label", "legend", "li", "listing", "main", "map", "mark",
	"marquee", "menu", "menuitem", "meter", "multicol", "nav", "nobr",
	"noembed", "noframes", "noscript", "object", "ol", "optgroup",
	"option", "output", "p", "picture", "plaintext", "pre", "progress",
	"q", "rp", "rt", "rtc", "ruby", "s", "samp", "script", "section",
	"select", "shadow", "small", "spacer", "span", "strike", "strong",
	"style", "sub", "summary", "sup", "table", "tbody", "td", "template",
	"textarea", "tfoot", "th", "thead", "time", "title", "tr", "tt", "u",
	"ul", "var", "video", "xmp"
];

Node.voidElements = [
	"area", "base", "br", "col", "embed", "hr", "img", "input", "keygen",
	"link", "meta", "param", "source", "track", "wbr"
];

Node.elements.forEach(function addElement(element) {
	Node.addElement(element, {isVoid: false});
});

Node.voidElements.forEach(function addElement(element) {
	Node.addElement(element, {isVoid: true});
});

Node.prototype.on = function(event, listener) {
	var node = this;

	addListener(event, listener, node.listeners);

	return node;
}

/* Provides an immutable view of a node; removing its children. */
Node.freeze = function freeze(node) {
	return Node.new(node.name, node.isVoid, node.id, node.class, node.style, node.listeners, node.attributes, node.content, []);
};

/* Transforms a node tree into a nested list by taking each node and applying
 * the given function to it, then combining all results into said list.
 *
 * Each node is passed to the given function without its children to prevent
 * mutation (but all children are still iterated upon). */
Node.prototype.transform = function transform(fn) {
	var node = this;

	var head = [fn(Node.freeze(node))];
	var tail = node.children.map(function transformChild(child) {
		return child.transform(fn);
	});

	return head.concat(tail);
};

/* Turns a node tree into a nested list.
 *
 * All child node members are removed from `node.children`, and are instead
 * represented as sub-lists of the parent in the returned list. */
Node.prototype.toList = function toList() {
	var node = this;

	return node.transform(function id(node) { return node; });
};

/* Traverses a node tree, applying a function to each node in the tree,
 * returning a new (non-reference) tree from that computation.
 *
 * While the returned tree itself is immutable, if node members contain
 * references, the corresponding node member in the new tree will also point to
 * that reference. */
Node.prototype.traverse = function traverse(fn) {
	var node = this;

	var root   = fn(Node.freeze(node));
	var leaves =  node.children.map(function traverseChild(child) {
		return child.traverse(fn);
	});

	root.children = leaves;

	return root;
};

function htmlEscape(content) {
	// This is written this way to avoid multiple replace passes.
	return String(content).replace(/&|<|>|"|'/g, function replaceMatch(match) {
		if (match === '&') {
			return '&amp;';
		} else if (match === '<') {
			return '&lt;';
		} else if (match === '>') {
			return '&gt;';
		} else if (match === '"') {
			return '&quot;';
		} else if (match === '\'') {
			return '&apos;';
		}
	});
}

// https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
function isBooleanAttribute(attribute) {
    return (/^(?:allowfullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultchecked|defaultmuted|defaultselected|defer|disabled|draggable|enabled|formnovalidate|hidden|indeterminate|inert|ismap|itemscope|loop|multiple|muted|nohref|noresize|noshade|novalidate|nowrap|open|pauseonexit|readonly|required|reversed|scoped|seamless|selected|sortable|spellcheck|translate|truespeed|typemustmatch|visible)$/i).test(attribute);
}

/* Renders a singleton attribute key, or a key-value attribute pair,
 * HTML-escaping the value. */
function renderAttribute(key, value) {
	var isBoolAttr = isBooleanAttribute(key);

	if (isBoolAttr && value === true) {
		return key + '="' + key + '"';
	} else if (isBoolAttr && value === false) {
		return '';
	} else {
		return key + '="' + htmlEscape(value) + '"';
	}
}

function renderStyle(style) {
	return Object.keys(style).reduce(function styler(styleString, property) {
		return styleString + property + ':' + style[property] + ';';
	}, '');
}

/* Renders a node tree into an HTML string. */
Node.prototype.render = function render() {
	var node = this;

	var attributes = Object.keys(node.attributes).reduce(function reduceAttr(attrs, key) {
		return attrs + ' ' + renderAttribute(key, node.attributes[key]);
	}, '');

	var childContents = htmlEscape(node.content) +
		node.children.reduce(function reduceChild(contents, child) {
			return contents +
				(isString(child) ? htmlEscape(child) : child.render());
		}, '');

	return '<' + node.name +
		(node.id ? ' id="' + node.id + '"' : '') +
		(node.class.length !== 0 ? ' class="' + node.class.join(' ') + '"' : '') +
		(node.style ? ' style="' + renderStyle(node.style) + '"' : '') +
		attributes +
		'>' +
		// It is still possible for a void node to be given children:
		// in such a case, their children are iterated upon anyway.
		// Browsers allow this behavior, so it is allowed here.
		(!node.isVoid || !(node.children.length === 0) ?
			 childContents +
			 '</' + node.name + '>' :
			 '');
};

/* Renders a list of nodes into an HTML string. */
Node.renderList = function renderList(nodeList) {
	return nodeList.map(function renderNode(node) {
		return node.render();
	}).join('');
}

/* Converts a node tree into a DOM tree.
 *
 * The parameter is a `document` object by which elements, attributes and the
 * like will be created by. If none is passed in, the implicit global
 * `document` object will be used. */
Node.prototype.toDOM = function toDOM(document_) {
	document_ = document_ || document;

	var node = this;

	var root = document_.createElement(node.name);

	Object.keys(node.attributes).forEach(function setAttr(key) {
		var value = node.attributes[key];

		var isBoolAttr = isBooleanAttribute(key);

		// If a known-boolean attribute from the HTML5 spec is
		// encountered, it is displayed or not displayed based on
		// whether it is `true` or `false`. All other values (including
		// other falsy ones) are passed-through (and converted into
		// strings):
		if (isBoolAttr && value === true) {
			root.setAttribute(key, key);
		} else if (isBoolAttr && value === false) {
			// NOP
		} else {
			root.setAttribute(key, value);
		}
	});

	if (node.id) {
		root.id = node.id;
	}

	if (node.class.length > 0) {
		root.className = node.class.join(' ');
	}

	if (node.style) {
		root.setAttribute('style', renderStyle(node.style));
	}

	if (node.listeners) {
		Object.keys(node.listeners).forEach(function addEvents(event) {
			node.listeners[event].forEach(function addListener(listener) {
				root.addEventListener(event, listener);
			});
		});
	}

	// Explicit coercive comparison because the only non-valid values here
	// are `null` and `undefined` (other other falsy values are perfectly
	// valid here).
	if (node.content != null) {
		root.appendChild(document_.createTextNode(node.content));
	}

	// It is still possible for a void node to be given children: in such a
	// case, their children are iterated upon anyway. The browsers allow
	// this behavior, so it is allowed here.
	node.children.forEach(function toDOMChild(child) {
		root.appendChild(isString(child) ?
			document_.createTextNode(child) :
			child.toDOM(document_));
	});

	return root;
};

/* First turns a list of nodes into DOM nodes, and then appends them to the
 * supplied DOM element.
 *
 * The third parameter is a `document` object by which elements, attributes and
 * the like will be created by. If none is passed in, the implicit global
 * `document` object will be used. */
Node.appendListToDOM = function appendListToDOM(parent, nodeList, document_) {
	nodeList.forEach(function toDOMNode(node) {
		parent.appendChild(node.toDOM(document_));
	});
}

return Node;

}));
// And without faith it is impossible to please God, because anyone who comes
// to Him must believe that He exists and that He rewards those who earnestly
// seek Him. - Hebrews 11:6
