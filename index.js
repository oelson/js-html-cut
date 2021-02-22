module.exports = {
  compareAddresses,
  getElementByAddress,
  getAddressOfElement,
  getFirstAddress,
  getLastAddress,
  nextNode,
  subNode,
  cloneNodeProgressive,
};

function compareAddresses(a, b, i = 0) {
  if (!Array.isArray(a) || !Array.isArray(b)) return undefined;
  let a1 = a[i],
    b1 = b[i];
  if (a1 !== undefined && b1 !== undefined) {
    if (a1 === b1) return compareAddresses(a, b, i + 1);
    else if (a1 < b1) return -1;
    else return +1;
  } else if (a1 === undefined && b1 === undefined) {
    return 0;
  } else if (a1 === undefined) {
    return -1;
  } else if (b1 === undefined) {
    return +1;
  }
}

function getElementByAddress(root, path) {
  let node = root;
  for (const number of path) {
    const index = number - 1;
    node = node.childNodes[index];
  }
  return node;
}

function getAddressOfElement(root, node) {
  if (node === null || node === undefined) {
    return undefined;
  } else if (node === root) {
    return [];
  } else {
    const parent = node.parentNode;
    const index = Array.prototype.indexOf.call(parent.childNodes, node);
    const number = index + 1;
    const path = [number];
    if (parent !== root) {
      const subPath = getAddressOfElement(root, parent);
      if (subPath === undefined) {
        return undefined;
      } else {
        return subPath.concat(path);
      }
    } else {
      return path;
    }
  }
}

function getFirstAddress(root) {
  const node = root.firstChild;
  return getAddressOfElement(root, node);
}

function getLastAddress(root) {
  let node;
  for (
    node = root.lastChild;
    node && node.lastChild !== null;
    node = node.lastChild
  );
  return getAddressOfElement(root, node);
}

function nextNode(root, node) {
  // can go in depth
  if (node.childNodes !== undefined && node.childNodes.length > 0) {
    return node.childNodes[0];
  }
  // maximum depth: try to go to next element
  else {
    // go up while we are at the end of a level
    while (
      node.parentNode !== null &&
      node.parentNode !== root &&
      node.nextSibling === null
    ) {
      node = node.parentNode;
    }
    // return the next, except if we've hit the root
    if (node === root) {
      return undefined;
    } else {
      return node.nextSibling !== null ? node.nextSibling : undefined;
    }
  }
}

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

function getOrderList(node) {
  if (
    node.nodeType === ELEMENT_NODE &&
    node.tagName === "LI" &&
    node.parentNode.tagName === "OL"
  ) {
    return { ol: node.parentNode, li: node };
  } else if (
    node.nodeType === TEXT_NODE &&
    node.parentNode.tagName === "LI" &&
    node.parentNode.parentNode.tagName === "OL"
  ) {
    return { ol: node.parentNode.parentNode, li: node.parentNode };
  }
}

function removeBefore(root, node) {
  if (node !== null && node !== root) {
    // preserve ordered list number accross cut
    const orderedList = getOrderList(node);
    if (orderedList !== undefined) {
      const { ol, li } = orderedList;
      const index = Array.prototype.indexOf.call(ol.children, li);
      const number = index + 1;
      ol.setAttribute("start", number);
    }
    // previous siblings are before node
    while (node.previousSibling !== null) {
      node.previousSibling.remove();
    }
    // node's parent previous siblings are also before node
    let current = node;
    while (current !== root) {
      current = current.parentNode;
      while (current.previousSibling !== null) {
        current.previousSibling.remove();
      }
    }
  }
}

function removeFrom(root, node, nodeIncluded) {
  if (node !== null && node !== root) {
    // child elements are after node by definition
    while (node.firstChild) {
      node.firstChild.remove();
    }
    // next sibilings are after node
    while (node.nextSibling !== null) {
      node.nextSibling.remove();
    }
    // node's parent next siblings are also after node
    let current = node;
    while (current !== root) {
      current = current.parentNode;
      while (current.nextSibling !== null) {
        current.nextSibling.remove();
      }
    }
    if (!nodeIncluded) {
      // avoid leaving an empty latest parent
      const parent = node.parentNode;
      node.remove();
      if (parent.childNodes.length === 0) {
        parent.remove();
      }
    }
  }
}

function subNode(root, { from, to, inclusive }) {
  if (
    Array.isArray(from) &&
    from.length === 0 &&
    Array.isArray(to) &&
    to.length === 0
  ) {
    return root.cloneNode(false);
  } else {
    const source = root.cloneNode(true);
    const fromNode =
      from !== undefined ? getElementByAddress(source, from) : null;
    const toNode = to !== undefined ? getElementByAddress(source, to) : null;
    removeBefore(source, fromNode);
    removeFrom(source, toNode, inclusive);
    return source;
  }
}

function cloneSkeleton(root, child) {
  const childToAncestors = [];
  for (
    let current = child.parentNode;
    current !== root;
    current = current.parentNode
  ) {
    const clone = current.cloneNode(false);
    childToAncestors.push(clone);
  }

  for (let i = 0; i < childToAncestors.length - 1; i++) {
    const child = childToAncestors[i];
    const parent = childToAncestors[i + 1];
    parent.appendChild(child);
  }

  return {
    root: childToAncestors[childToAncestors.length - 1],
    leaf: childToAncestors[0],
  };
}

function cloneNodeProgressive(sourceRoot, targetRoot, stopCondition, from) {
  let source, target;

  // recreate the skeleton needed to append the starting node
  const { root, leaf } = cloneSkeleton(sourceRoot, from.node);
  if (root !== undefined) {
    targetRoot.appendChild(root);
  }
  source = {
    parent: from.node.parentNode,
    current: from.node,
    address: from.address.slice(),
  };
  target = {
    parent: leaf !== undefined ? leaf : targetRoot,
    current: null,
  };

  while (source.current !== null && source.current !== sourceRoot) {
    // clone
    target.current = source.current.cloneNode(false);
    target.parent.appendChild(target.current);

    if (stopCondition(source)) {
      return source;
    } else {
      // go deep
      if (source.current.childNodes.length > 0) {
        source.parent = source.current;
        source.current = source.current.firstChild;
        source.address.push(1);

        target.parent = target.current;
        target.current = null;
      }
      // go next
      else if (source.current.nextSibling !== null) {
        source.current = source.current.nextSibling;
        source.address[source.address.length - 1]++;
      }
      // go next parent
      else {
        // up
        while (
          source.current.nextSibling === null &&
          source.current.parentNode !== sourceRoot
        ) {
          source.current = source.current.parentNode;
          source.parent = source.current.parentNode;
          source.address.pop();

          target.current = target.current.parentNode;
          target.parent = target.current.parentNode;
        }
        // next
        source.current = source.current.nextSibling;
        source.address[source.address.length - 1]++;
      }
    }
  }
}
