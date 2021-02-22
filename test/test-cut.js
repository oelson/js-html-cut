const assert = require("assert");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const {
  compareAddresses,
  subNode,
  getElementByAddress,
  getAddressOfElement,
  getFirstAddress,
  getLastAddress,
  nextNode,
  cloneNodeProgressive,
} = require("../index");

describe("compareAddresses", function() {
  it("returns undefined if any addresses is undefined", function() {
    const result1 = compareAddresses([1], undefined);
    assert.strictEqual(undefined, result1);
    const result2 = compareAddresses(undefined, [1]);
    assert.strictEqual(undefined, result2);
    const result3 = compareAddresses(undefined, undefined);
    assert.strictEqual(undefined, result3);
  });
  it("returns  0 if both addresses are empty", function() {
    const result = compareAddresses([], []);
    assert.strictEqual(0, result);
  });
  it("returns  0 if addresses are equal and not empty", function() {
    const result = compareAddresses([1, 2, 3], [1, 2, 3]);
    assert.strictEqual(0, result);
  });
  it("returns +1 when first's tail is greater than second's", function() {
    const result = compareAddresses([1, 2, 4], [1, 2, 3]);
    assert.strictEqual(1, result);
  });
  it("returns -1 when first's tail is smaller than second's", function() {
    const result = compareAddresses([1, 2, 2], [1, 2, 3]);
    assert.strictEqual(-1, result);
  });
  it("returns -1 when first address is a prefix of second address", function() {
    const result = compareAddresses([1, 2], [1, 2, 1]);
    assert.strictEqual(-1, result);
  });
  it("returns -1 when first address is an empty prefix of second address", function() {
    const result = compareAddresses([], [1, 2]);
    assert.strictEqual(-1, result);
  });
  it("returns +1 when second address is a prefix of first address", function() {
    const result = compareAddresses([1, 2, 1], [1, 2]);
    assert.strictEqual(1, result);
  });
  it("returns +1 when second address is an empty prefix of first address", function() {
    const result = compareAddresses([1, 2], [1]);
    assert.strictEqual(1, result);
  });
});

describe("getElementByAddress", function() {
  it("returns the node given by address", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b><i>Think different</i></div>`);
    const root = document.getElementById("root");
    const result = getElementByAddress(root, [2]);
    assert.strictEqual(result.outerHTML, "<i>Think different</i>");
  });
  it("returns undefined if address doesn't match", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b><i>Think different</i></div>`);
    const root = document.getElementById("root");
    const result = getElementByAddress(root, [10]);
    assert.strictEqual(result, undefined);
  });
  it("returns the root for an empty address", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b><i>Think different</i></div>`);
    const root = document.getElementById("root");
    const result = getElementByAddress(root, []);
    assert.strictEqual(
      result.outerHTML,
      `<div id="root"><b>Be bold!</b><i>Think different</i></div>`
    );
  });
});

describe("getAddressOfElement", function() {
  it("returns the address of an element node", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i id="sub">Think different</i></div>`
    );
    const root = document.getElementById("root");
    const sub = document.getElementById("sub");
    const result = getAddressOfElement(root, sub);
    assert.deepStrictEqual(result, [2]);
  });
  it("returns the address of a text node", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i id="sub">Think different</i></div>`
    );
    const root = document.getElementById("root");
    const sub = document.getElementById("sub").firstChild;
    const result = getAddressOfElement(root, sub);
    assert.deepStrictEqual(result, [2, 1]);
  });
  it("returns an empty address for root node", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b><i>Think different</i></div>`);
    const root = document.getElementById("root");
    const result = getAddressOfElement(root, root);
    assert.deepStrictEqual(result, []);
  });
});

describe("getFirstAddress", function() {
  it("returns undefined if root has no child", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"></div>`);
    const root = document.getElementById("root");
    const result = getFirstAddress(root);
    assert.deepStrictEqual(result, undefined);
  });
  it("returns an address of [1] if root has a single node", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b></div>`);
    const root = document.getElementById("root");
    const result = getFirstAddress(root);
    assert.deepStrictEqual(result, [1]);
  });
  it("returns an address of [1] if root has many nodes", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b><i>Think different</i></div>`);
    const root = document.getElementById("root");
    const result = getFirstAddress(root);
    assert.deepStrictEqual(result, [1]);
  });
});

describe("getLastAddress", function() {
  it("returns undefined if root has no nodes", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"></div>`);
    const root = document.getElementById("root");
    const result = getLastAddress(root);
    assert.deepStrictEqual(result, undefined);
  });
  it("returns the address of the last node if root has one node", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b></b></div>`);
    const root = document.getElementById("root");
    const result = getLastAddress(root);
    assert.deepStrictEqual(result, [1]);
  });
  it("returns the address of the last node if root has many nodes", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b><i>Think different</i></div>`);
    const root = document.getElementById("root");
    const result = getLastAddress(root);
    assert.deepStrictEqual(result, [2, 1]);
  });
});

describe("nextNode", function() {
  it("returns the first text node within an element", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b id="sub">Be bold!</b><i>Think different</i></div>`
    );
    const root = document.getElementById("root");
    const sub = document.getElementById("sub");
    const result = nextNode(root, sub);
    assert.deepStrictEqual(result.nodeValue, "Be bold!");
  });
  it("returns node's parent's sibling if node is the last of it's parent", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b id="sub">Be bold!</b><i>Think different</i></div>`
    );
    const root = document.getElementById("root");
    const sub = document.getElementById("sub");
    const inner = sub.firstChild;
    const result = nextNode(root, inner);
    assert.deepStrictEqual(result.outerHTML, "<i>Think different</i>");
  });
  it("returns undefined if node is the last", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i id="sub">Think different</i></div>`
    );
    const root = document.getElementById("root");
    const sub = document.getElementById("sub");
    const last = sub.firstChild;
    const result = nextNode(root, last);
    assert.strictEqual(result, undefined);
  });
});

describe("subNode", function() {
  it("extracts from a starting address, to the end", function() {
    const {
      window: { document },
    } = new JSDOM(`<div id="root"><b>Be bold!</b><i>Think different</i></div>`);
    const root = document.getElementById("root");
    const sub = subNode(root, {
      from: [2],
    });
    assert.strictEqual(
      sub.outerHTML,
      '<div id="root"><i>Think different</i></div>'
    );
  });
  it("extracts from a starting address, to an ending address excluded", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
    const root = document.getElementById("root");
    const sub = subNode(root, {
      from: [1],
      to: [3],
      inclusive: false,
    });
    assert.strictEqual(
      sub.outerHTML,
      '<div id="root"><b>Be bold!</b><i>Think different</i></div>'
    );
  });
  it("extracts from a starting address, to an ending address included", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
    const root = document.getElementById("root");
    const sub = subNode(root, {
      from: [1],
      to: [3],
      inclusive: true,
    });
    assert.strictEqual(
      sub.outerHTML,
      '<div id="root"><b>Be bold!</b><i>Think different</i><u></u></div>'
    );
  });
  it("extracts from the begining, to an ending address included", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
    const root = document.getElementById("root");
    const sub = subNode(root, {
      to: [2, 1],
      inclusive: true,
    });
    assert.strictEqual(
      sub.outerHTML,
      '<div id="root"><b>Be bold!</b><i>Think different</i></div>'
    );
  });
  it("extracts from the begining, to the end", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
    const root = document.getElementById("root");
    const sub = subNode(root, {});
    assert.strictEqual(
      sub.outerHTML,
      `<div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
  });
});

describe("cloneNodeProgressive", function() {
  it("clones the complete source node and returns undefined, when stop condition is always false", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
    const source = document.getElementById("root");
    const target = document.createElement("div");
    const overflow = cloneNodeProgressive(source, target, () => false, {
      node: source.firstChild,
      address: [1],
    });
    assert.strictEqual(overflow, undefined);
    assert.strictEqual(
      target.outerHTML,
      `<div><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
  });
  it("clones the source node from starting point, increment addresses, and returns overflow when stop condition is true", function() {
    const {
      window: { document },
    } = new JSDOM(
      `<div id="root"><b>Be bold!</b><i>Think different</i><u>But be productive</u></div>`
    );
    const source = document.getElementById("root");
    const target = document.createElement("div");
    // address is deliberately shifted
    const from = { node: source.firstChild, address: [9] };
    const overflow = cloneNodeProgressive(
      source,
      target,
      ({ current }) => current.nodeValue === "Think different",
      from
    );
    assert.deepStrictEqual(overflow.address, [10, 1]);
    assert.strictEqual(target.outerHTML, "<div><b>Be bold!</b><i>Think different</i></div>");
  });
});
