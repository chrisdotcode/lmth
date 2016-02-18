;(function (root, factory) {
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
}(this, function () {

'use strict';

/* An Markup Language Node. */
function Node(name, id, class_, attributes, content, children) {
	if (!(this instanceof Node)) {
		throw new Error("Uh-oh. You're creating a new Node without using the `new` keyword. This isn't allowed because Bad Stuff happens when you do that. What you more than likely want is one of the element functions attached to the Node object like so: `lmth.div(...)`. If you actually did want to create a plain node, you should use `Node.createNode(name, id, class_, attributes, content, children)` and avoid the manual construction with `new` where possible. If you really, really, really want to create a node with `new`, you can do so like this: `new Node(name, class, attributes, content, children)`.");
	}

	this.name       = name;
	this.id         = id;
	this.class      = class_;
	this.attributes = attributes;
	this.content    = content;

	// We explicitly want `node.children` to be undefined if there are no children passed in.
	if (children) {
		this.children = children;
	}

	return this;
}

Node.prototype.toString = function toString() {
	return JSON.stringify(this);
};

/* Shorthand for node creation. */
Node.createNode = function createNode(name, id, class_, attributes, content, children) {
	return new Node(name, id, class_, attributes, content, children);
};

function isString(x) {
	return toString.call(x) === '[object String]';
}

function isObject(x) {
	return toString.call(x) === '[object Object]';
}

function typeOf(x) {
	if (isString(x)) {
		return 'string';
	} else if (isObject(x)) {
		return 'object';
	} else if (Array.isArray(x)) {
		return 'array';
	}
}

function startsWith(needle, haystack) {
	return haystack.indexOf(needle) === 0;
}

/* Takes either a list of classes and attributes as a string, or a hash of
 * attributes and normalizes them into the format used when creating new Nodes.
 * */
function parseAttributes(attributes) {
	var attrs = {
		id        : null,
		class     : [],
		attributes: {},
	};

	var typeOfAttributes = typeOf(attributes);

	if (typeOfAttributes === 'string') {
		var classesAndId = attributes.split(/([#\.][^#\.]+)/);

		classesAndId.forEach(function(classOrId) {
			if (classOrId.length === 0) {
				return;
			} else if (startsWith('.', classOrId)) {
				attrs.class.push(classOrId.substring(1));
			} else if (startsWith('#', classOrId)) {
				// According to the spec, only one id is
				// allowed, so any newer one overrides an older
				// one.
				attrs.id = classOrId.substring(1);
			}
		});
	} else if (typeOfAttributes === 'object') {
		if (attributes.id) {
			attrs.id = String(attributes.id);
			delete attributes.id;
		}

		if (attributes.class) {
			attrs.class = String(attributes.class);
			delete attributes.class;

			if (typeOf(attrs.class) === 'string') {
				attrs.class = attrs.class.split(' ');
			}
		}

		Object.keys(attributes).forEach(function addAttr(key) {
			attrs.attributes[key] = String(attributes[key]);
		});
	}

	return attrs;
}

/* Returns a function that creates an element node with the given name. */
Node.createElement = function createElement(name) {
	return function createNode(one, two, three) {
		var content    = '';
		var attributes = {};
		var children   = [];

		var typeOfOne = typeOf(one);
		var typeOfTwo = typeOf(two);

		if (typeOfOne === 'string' && typeOfTwo === 'string') {
			attributes = one;
			content    = two;
		} else if (typeOfOne === 'string') {
			content = one;
		} else if (typeOfOne === 'object') {
			attributes = one;
		} else if (typeOfOne === 'array') {
			children = one;
		}

		if (typeOfTwo === 'string') {
			// In this case, `typeOfOne` is guaranteed to not be a
			// string because of the fallthrough above.
			content = two;
		} else if (typeOfTwo === 'object') {
			attributes = two;
		} else if (typeOfTwo === 'array') {
			children = two;
		}

		if (typeOf(three) === 'array') {
			children = three;
		}

		var attributes_ = parseAttributes(attributes);

		return new Node(name, attributes_.id, attributes_.class,
			attributes_.attributes,
			content,
			children);
	}
};

Node.addElement = function addElement(element) {
	Node[element] = Node.createElement(element);
};

Node.elements = [
	"a", "abbr", "acronym", "address", "applet", "area", "article",
	"aside", "audio", "b", "base", "basefont", "bdi", "bdo", "bgsound",
	"big", "blink", "blockquote", "body", "br", "button", "canvas",
	"caption", "center", "cite", "code", "col", "colgroup", "command",
	"content", "data", "datalist", "dd", "del", "details", "dfn", "dialog",
	"dir", "div", "dl", "dt", "element", "em", "embed", "fieldset",
	"figcaption", "figure", "font", "footer", "form", "frame", "frameset",
	"h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr",
	"html", "i", "iframe", "image", "img", "input", "ins", "isindex",
	"kbd", "keygen", "label", "legend", "li", "link", "listing", "main",
	"map", "mark", "marquee", "menu", "menuitem", "meta", "meter",
	"multicol", "nav", "nobr", "noembed", "noframes", "noscript", "object",
	"ol", "optgroup", "option", "output", "p", "param", "picture",
	"plaintext", "pre", "progress", "q", "rp", "rt", "rtc", "ruby", "s",
	"samp", "script", "section", "select", "shadow", "small", "source",
	"spacer", "span", "strike", "strong", "style", "sub", "summary", "sup",
	"table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead",
	"time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr",
	"xmp"
];

Node.elements.forEach(Node.addElement);

Node.voidElements = [
	"area", "base", "br", "col", "embed", "hr", "img", "input", "keygen",
	"link", "meta", "param", "source", "track", "wbr"
];

/* Provides an immutable view of a node, removing its children. */
Node.freeze = function freeze(node) {
	return new Node(node.name, node.id, node.class, node.attributes, node.content);
};

/* Transforms a node tree into a nested list by taking each node and applying
 * the given function to it, then combining all results into said list.
 *
 * Each node is passed to the given function without its children to prevent
 * mutation (but all children are still iterated upon). If you need to
 * mutate your tree in place (having access to the children during iteration), use
 * Node.prototype.modify. */
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
 * All child node members are removed from nodes, and are instead represented
 * as sub-lists of the parent in the returned list. */
Node.prototype.toList = function toList() {
	var node = this;

	return node.transform(function id(node) { return node; });
};

/* Traverses a node tree, applying a function to each node in the tree,
 * returning a new (non-reference) tree from that computation.
 *
 * While the returned tree itself is immutable, if node members contain
 * references, the corresponding node in the new tree will also point to that
 * reference. */
Node.prototype.traverse = function traverse(fn) {
	var node = this;

	var root   = fn(Node.freeze(node));
	var leaves =  node.children.map(function traverseChild(child) {
		return child.traverse(fn);
	});

	root.children = leaves;

	return root;
};

function htmlEscape(textContent) {
	// This is written this way to avoid multiple replace passes.
	return textContent.replace(/&|<|>|"|'/g, function(match) {
		switch (match) {
		case '&':
			return '&amp;';
		case '<':
			return '&lt;';
		case '>':
			return '&gt;';
		case '"':
			return '&quot;';
		case '\'':
			return '&apos';
		}
	});
}

/* Renders a singleton attribute key, or a key-value attribute pair. */
function renderAttribute(key, value) {
	if (!value) {
		return key;
	} else {
		return key + '="' + htmlEscape(value) + '"';
	}
}

/* Renders a node tree into an HTML string. */
Node.prototype.render = function render() {
	var node = this;

	var attributes = Object.keys(node.attributes).reduce(function(attrs, key) {
		return attrs + ' ' + renderAttribute(key, node.attributes[key]);
	}, '');

	var childContents = node.children.reduce(function(contents, child) {
		return contents + child.render();
	}, '');

	var childContentsAndClosingTags = htmlEscape(node.content) +
		childContents +
		'</' + node.name + '>';

	return '<' + node.name +
		(node.id ? ' id="' + node.id + '"' : '') +
		(node.class.length !== 0 ? ' class="' + node.class.join(' ') + '"' : '') +
		attributes +
		'>' +
		(Node.voidElements.indexOf(node.name) !== -1 ? ''
			: childContentsAndClosingTags);
};

/* Renders a list of nodes into an HTML string. */
Node.renderList = function renderList(nodeList) {
	return nodeList.map(function(node) { return node.render(); }).join('');
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

	Object.keys(node.attributes).forEach(function(key) {
		root.setAttribute(key, node.attributes[key]);
	});

	if (node.id) {
		root.id = node.id;
	}
	if (node.class.length !== 0) {
		root.className = node.class.join(' ');
	}

	if (node.content) {
		root.appendChild(document_.createTextNode(node.content));
	}

	node.children.forEach(function(node) {
		root.appendChild(node.toDOM(document_));
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
	nodeList.forEach(function(node) { parent.appendChild(node.toDOM(document_)); });
}

return Node;

}));
