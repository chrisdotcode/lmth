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

function Node(name, id, class_, attributes, content, children) {
	if (!(this instanceof Node)) {
		throw new Error("Uh-oh. You're creating a new Node without using the `new` keyword. This isn't allowed because Bad Stuff happens when you do that. What you more than likely want is one of the element functions attached to the Node object like so: `lmth.div(...)`. If you actually did want to create a plain node, you should use `Node.new(name, id, class_, attributes, content, children)` and avoid the manual construction with `new` where possible. If you really, really, really want to create a node with `new`, you can do so like this: `new Node(name, class, attributes, content, children)`.");
	}

	this.name       = name;
	this.id         = id;
	this.class      = class_;
	this.attributes = attributes;
	this.content    = content;
	this.children   = children || [];

	return this;
}

Node.prototype.toString = function toString() {
	return JSON.stringify(this);
};

Node.new = function new_(name, id, class_, attributes, content, children) {
	return new Node(name, id, class_, attributes, content, children);
};

/* 'Primitive' defined here is a strict subset of all actual JavaScript
 * primitives. Primitives, in our case are either `string`s, `number`s, or
 * `bool`s. */
function isPrimitive(x) {
	switch (typeof(x)) {
	case 'bool':
	case 'number':
	case 'string':
		return true;
	default:
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

/* Takes either a list of classes and attributes as a string, or a hash of
 * attributes and normalizes them into the format used when creating new Nodes.
 * */
function parseAttributes(attributes) {
	var nodeAttributes = {
		id   : null,
		class: [],
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
			nodeAttributes[attribute] = attributes[attribute];
		});

		if (!Array.isArray(nodeAttributes.class)) {
			nodeAttributes.class = nodeAttributes.class.split(' ');
		}
	}

	return nodeAttributes;
}

/* Returns a function that creates an element node with the given name. */
Node.createElement = function createElement(name) {
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
		delete nodeAttributes.id;
		delete nodeAttributes.class;

		return Node.new(name, id, class_, nodeAttributes, content,
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

/* Provides an immutable view of a node; removing its children. */
Node.freeze = function freeze(node) {
	return Node.new(node.name, node.id, node.class, node.attributes, node.content);
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
			return '&apos;';
		}
	});
}

/* Renders a singleton attribute key, or a key-value attribute pair,
 * HTML-escaping the value. */
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

	var attributes = Object.keys(node.attributes).reduce(function reduceAttr(attrs, key) {
		return attrs + ' ' + renderAttribute(key, node.attributes[key]);
	}, '');

	var childContents = node.children.reduce(function reduceChild(contents, child) {
		return contents +
			(isString(child) ? htmlEscape(child) : child.render());
	}, '');

	var childContentsAndClosingTags = htmlEscape(node.content) +
		childContents +
		'</' + node.name + '>';

	return '<' + node.name +
		(node.id ? ' id="' + node.id + '"' : '') +
		(node.class.length !== 0 ? ' class="' + node.class.join(' ') + '"' : '') +
		attributes +
		'>' +
		(Node.voidElements.indexOf(node.name) !== -1 ? '' : childContentsAndClosingTags);
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
		root.setAttribute(key, node.attributes[key]);
	});

	if (node.id) {
		root.id = node.id;
	}

	if (Array.isArray(node.class)) {
		root.className = node.class.join(' ');
	}

	// Explicit coercive comparison because the only non-valid values here
	// are `null` and `undefined` (other other falsy values are perfectly
	// valid here).
	if (node.content != null) {
		root.appendChild(document_.createTextNode(node.content));
	}

	node.children.forEach(function toDOMChild(child) {
		root.appendChild(isString(child) ?
			document_.createTextNode(child) :
			node.toDOM(document_));
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
