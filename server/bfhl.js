/**
 * BFHL Core Processing Logic
 * Handles validation, deduplication, tree construction,
 * cycle detection, depth calculation, and summary generation.
 */

// ─── Identity ────────────────────────────────────────────────────────────────
const IDENTITY = {
  user_id: "abhiramchintalapati_25012006", // UPDATE: fullname_ddmmyy
  email_id: "ac7320@srmist.edu.in", // UPDATE: your college email
  college_roll_number: "RA2311003010451", // UPDATE: your actual roll number
};

// ─── Validation ──────────────────────────────────────────────────────────────
/**
 * Returns trimmed string if the entry is a valid edge (X->Y, single uppercase letter each, not self-loop),
 * otherwise returns null.
 */
function validateEntry(raw) {
  const entry = raw.trim();
  // Must match exactly: single uppercase -> single uppercase
  if (!/^[A-Z]->[A-Z]$/.test(entry)) return null;
  // Self-loop
  const [parent, child] = entry.split("->"); // exactly 2 parts guaranteed by regex
  if (parent === child) return null;
  return entry;
}

// ─── Graph Utilities ─────────────────────────────────────────────────────────
/**
 * Given a list of valid (trimmed) edge strings, build:
 *  - adjacency map: parent -> [children] (first-parent-wins enforced here)
 *  - childSet: set of all nodes that appear as a child
 *  - nodeSet: set of all nodes
 */
function buildGraph(validEdges) {
  const adj = {}; // parent -> children[]
  const childParent = {}; // child -> first parent (diamond rule)
  const childSet = new Set();
  const nodeSet = new Set();

  for (const edge of validEdges) {
    const [parent, child] = edge.split("->");
    nodeSet.add(parent);
    nodeSet.add(child);

    // Diamond / multi-parent rule: first parent wins; subsequent are silently discarded
    if (childParent.hasOwnProperty(child)) {
      // Already has a parent — skip this edge entirely (don't add to adj)
      continue;
    }

    childParent[child] = parent;
    childSet.add(child);

    if (!adj[parent]) adj[parent] = [];
    adj[parent].push(child);
  }

  return { adj, childSet, nodeSet };
}

// ─── Connected Components ─────────────────────────────────────────────────────
/**
 * Group nodes into connected components (undirected DFS).
 */
function getConnectedComponents(nodeSet, adj) {
  const visited = new Set();
  const components = [];

  // Build undirected adjacency for component detection
  const undirected = {};
  for (const node of nodeSet) undirected[node] = new Set();
  for (const [parent, children] of Object.entries(adj)) {
    for (const child of children) {
      undirected[parent].add(child);
      if (!undirected[child]) undirected[child] = new Set();
      undirected[child].add(parent);
    }
  }

  function dfs(node, component) {
    visited.add(node);
    component.add(node);
    for (const neighbor of (undirected[node] || new Set())) {
      if (!visited.has(neighbor)) dfs(neighbor, component);
    }
  }

  for (const node of nodeSet) {
    if (!visited.has(node)) {
      const component = new Set();
      dfs(node, component);
      components.push(component);
    }
  }

  return components;
}

// ─── Cycle Detection ─────────────────────────────────────────────────────────
/**
 * Detect if the directed subgraph (restricted to nodes in `componentNodes`) has a cycle.
 * Uses DFS with recursion stack.
 */
function hasCycle(componentNodes, adj) {
  const visited = new Set();
  const recStack = new Set();

  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    for (const child of (adj[node] || [])) {
      if (!componentNodes.has(child)) continue; // only within component
      if (!visited.has(child)) {
        if (dfs(child)) return true;
      } else if (recStack.has(child)) {
        return true;
      }
    }
    recStack.delete(node);
    return false;
  }

  for (const node of componentNodes) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  return false;
}

// ─── Tree Builder ─────────────────────────────────────────────────────────────
/**
 * Recursively build a nested tree object from adj list.
 */
function buildTree(node, adj) {
  const children = adj[node] || [];
  const obj = {};
  for (const child of children) {
    obj[child] = buildTree(child, adj);
  }
  return obj;
}

// ─── Depth Calculator ─────────────────────────────────────────────────────────
/**
 * Depth = number of nodes on the longest root-to-leaf path.
 */
function calcDepth(node, adj) {
  const children = adj[node] || [];
  if (children.length === 0) return 1;
  return 1 + Math.max(...children.map((c) => calcDepth(c, adj)));
}

// ─── Main Processor ───────────────────────────────────────────────────────────
function processBFHL(data) {
  if (!Array.isArray(data)) {
    throw new Error("'data' must be an array of strings");
  }

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const validEdges = [];

  // ── Step 1: Validate and deduplicate ─────────────────────────────────────
  for (const raw of data) {
    if (typeof raw !== "string") {
      invalidEntries.push(String(raw));
      continue;
    }
    const valid = validateEntry(raw);
    if (valid === null) {
      invalidEntries.push(raw); // preserve original (untrimmed) for reporting
      continue;
    }
    if (seenEdges.has(valid)) {
      // Only push to duplicates once per unique duplicate edge
      if (!duplicateEdges.includes(valid)) {
        duplicateEdges.push(valid);
      }
    } else {
      seenEdges.add(valid);
      validEdges.push(valid);
    }
  }

  // ── Step 2: Build directed graph ─────────────────────────────────────────
  const { adj, childSet, nodeSet } = buildGraph(validEdges);

  // ── Step 3: Get connected components ─────────────────────────────────────
  const components = getConnectedComponents(nodeSet, adj);

  // ── Step 4: Build hierarchy for each component ───────────────────────────
  const hierarchies = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestDepth = -1;
  let largestRoot = null;

  for (const component of components) {
    const cyclic = hasCycle(component, adj);

    if (cyclic) {
      // Find root: node never appearing as a child within this component.
      // For a pure cycle (all appear as children), use lex smallest.
      const possibleRoots = [...component].filter((n) => !childSet.has(n));
      const root =
        possibleRoots.length > 0
          ? possibleRoots.sort()[0]
          : [...component].sort()[0];

      hierarchies.push({ root, tree: {}, has_cycle: true });
      totalCycles++;
    } else {
      // Non-cyclic: find root(s) — nodes with no parent
      const possibleRoots = [...component].filter((n) => !childSet.has(n));
      // There should be exactly 1 root per acyclic component (guaranteed by tree structure)
      const root = possibleRoots.sort()[0];

      const tree = { [root]: buildTree(root, adj) };
      const depth = calcDepth(root, adj);

      hierarchies.push({ root, tree, depth });
      totalTrees++;

      // Track largest tree
      if (
        depth > largestDepth ||
        (depth === largestDepth && root < largestRoot)
      ) {
        largestDepth = depth;
        largestRoot = root;
      }
    }
  }

  // Sort hierarchies: non-cyclic trees first (by root lex), then cycles
  hierarchies.sort((a, b) => {
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root < b.root ? -1 : a.root > b.root ? 1 : 0;
  });

  const summary = {
    total_trees: totalTrees,
    total_cycles: totalCycles,
    largest_tree_root: largestRoot || "",
  };

  return {
    ...IDENTITY,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary,
  };
}

module.exports = { processBFHL };
