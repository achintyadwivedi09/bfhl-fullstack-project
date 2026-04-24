const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/bfhl", (req, res) => {
    try {
        const input = req.body.data || [];

        const user_id = "achintyadwivedi_09072005";
        const email_id = "ad1411@srmist.edu.in";
        const college_roll_number = "RA2311028010026";

        let validEdges = [];
        let invalid_entries = [];
        let duplicate_edges = [];

        const seen = new Set();

        // STEP 1: validate input
        input.forEach((item) => {
            if (!item || typeof item !== "string") {
                invalid_entries.push(item);
                return;
            }

            const trimmed = item.trim();

            const match = /^[A-Z]->[A-Z]$/.test(trimmed);

            if (!match || trimmed[0] === trimmed[3]) {
                invalid_entries.push(trimmed);
            } else {
                if (seen.has(trimmed)) {
                    if (!duplicate_edges.includes(trimmed)) {
                        duplicate_edges.push(trimmed);
                    }
                } else {
                    seen.add(trimmed);
                    validEdges.push(trimmed);
                }
            }
        });

        // STEP 2: build graph
        let graph = {};
        let childrenSet = new Set();
        let nodes = new Set();

        validEdges.forEach(edge => {
            const [parent, child] = edge.split("->");

            if (!graph[parent]) graph[parent] = [];
            graph[parent].push(child);

            nodes.add(parent);
            nodes.add(child);
            childrenSet.add(child);
        });

        let hierarchies = [];
        let total_trees = 0;
        let total_cycles = 0;
        let maxDepth = 0;
        let largest_tree_root = "";

        // DFS for tree + cycle detection
        const buildTree = (node, visited, stack) => {
            if (stack.has(node)) return "cycle";
            if (visited.has(node)) return {};

            visited.add(node);
            stack.add(node);

            let obj = {};
            if (graph[node]) {
                for (let child of graph[node]) {
                    const res = buildTree(child, visited, stack);
                    if (res === "cycle") return "cycle";
                    obj[child] = res;
                }
            }

            stack.delete(node);
            return obj;
        };

        const getDepth = (node) => {
            if (!graph[node] || graph[node].length === 0) return 1;
            let depths = graph[node].map(child => getDepth(child));
            return 1 + Math.max(...depths);
        };

        let processed = new Set();

        nodes.forEach(node => {
            if (processed.has(node)) return;

            let visited = new Set();
            let stack = new Set();

            let treeResult = buildTree(node, visited, stack);

            visited.forEach(n => processed.add(n));

            if (treeResult === "cycle") {
                total_cycles++;
                hierarchies.push({
                    root: node,
                    tree: {},
                    has_cycle: true
                });
            } else {
                let depth = getDepth(node);
                total_trees++;

                if (depth > maxDepth || (depth === maxDepth && node < largest_tree_root)) {
                    maxDepth = depth;
                    largest_tree_root = node;
                }

                hierarchies.push({
                    root: node,
                    tree: { [node]: treeResult },
                    depth: depth
                });
            }
        });

        res.json({
            user_id,
            email_id,
            college_roll_number,
            hierarchies,
            invalid_entries,
            duplicate_edges,
            summary: {
                total_trees,
                total_cycles,
                largest_tree_root
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});