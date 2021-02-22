# html-cut

A simple and robust way to extract copies of portions of DOM using numerical addresses as identifiers of cut points.

About addresses:

- Address are always relative to a root node.
- Numbers of the addresses are 1-based indexes (don't you know 0-based indexes are evil?)
- The address of the first child element of the root is [1], the second is [2].
- The address of the first grandson is [1, 1], the second grandson is [1, 2], etc.
- The address of the root is the empty array [] for consistency.

# Code examples

See unit test for full documentation of each function!

## subNode

Extract a portion of a DOM node while keeping the outer structure intact (essentially to maintain CSS intact on cloned portions):

```javascript
const { subNode } = require("html-cut");
// <div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>
const root = document.getElementById("root");
const sub = subNode(root, { from: [1], to: [3], inclusive: false });
console.log(sub.outerHTML);
// <div id="root"><b>Be bold!</b><i>Think different</i></div>
```

Let's say you want to cut at a point and get the portion of the DOM before, plus the portion after:

```javascript
const { subNode } = require("html-cut");
// <div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>
const root = document.getElementById("root");
const cutAddress = [2];
const before = subNode(root, { to: cutAddress, inclusive: false });
console.log(before.outerHTML);
// <div id="root"><b>Be bold!</b></div>
const after = subNode(root, { from: cutAddress, inclusive: true });
console.log(after.outerHTML);
// <div id="root"><i>Think different</i><u>But be productive</u></div>
```

## cloneNodeProgressive

It is possible to directly clone a portion of a root node to a target node, from a starting node/address until a dynamic condition is met:

```javascript
const { cloneNodeProgressive } = require("html-cut");
// <div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>
const source = document.getElementById("root");
// <div />
const target = document.createElement("div");
// address must be given with the node because it will be incremented as cloning progresses
const from = { node: source.firstChild, address: [1] };
// Stop when a specific text node is met
const stop = ({ current }) => current.nodeValue === "Think different";
const overflow = cloneNodeProgressive(source, target, stop, from);
// "overflow" represents the last visisted node in source, for which the lambda returned true
// the overflow node that matched the lambda was the text node
console.log(overflow);
// { address: [2, 1], parent: [object HTMLElement], current: [object Text] }
console.log(target.outerHTML);
// <div><b>Be bold!</b><i>Think different</i></div>
```

## compareAddresses

You can compare addresses through a total order function.

```javascript
const { compareAddresses } = require("html-cut");
//  0 : equality
compareAddresses([1, 2, 3], [1, 2, 3]);
// -1 : the first address represents a node which is before the second
compareAddresses([1, 2, 2], [1, 2, 3]);
// +1 : the first address represents a node which is after the second
compareAddresses([1, 2], [1]);
```

## getElementByAddress

You can query a node by it's address, provided that you also give the root node:

```javascript
const { getElementByAddress } = require("html-cut");
// <div id="root"><b>Be bold!</b><i>Think different</i></div>
const root = document.getElementById("root");
const result = getElementByAddress(root, [2]);
console.log((result.outerHTML);
// <i>Think different</i>
```

## getAddressOfElement

You can also compute the address of a node, provided that you give the root:

```javascript
const { getAddressOfElement } = require("html-cut");
// <div id="root"><b>Be bold!</b><i id="sub">Think different</i></div>
const root = document.getElementById("root");
const sub = document.getElementById("sub");
const result = getAddressOfElement(root, sub);
console.log(result);
// [2]
// also works for text children
const subText = sub.firstChild;
const resultText = getAddressOfElement(root, subText);
console.log(resultText);
// [2, 1]
```

## Utility

And finally some utility functions:

```javascript
const { getFirstAddress, getLastAddress, nextNode } = require("html-cut");

// <div id="root"><b id="sub">Be bold!</b><i>Think different</i></div>
const root = document.getElementById("root");

const firstAddress = getFirstAddress(root);
const lastAddress = getLastAddress(root);
console.log(firstAddress);
// [1] of undefined if root is empty
console.log(lastAddress);
// [1, 4, 2, 1] for instance, or undefined if root is empty

const sub = document.getElementById("sub");
const result = nextNode(root, sub);
// next node of a parent is it's first child
console.log(result.nodeValue);
// "Be bold!"
```
