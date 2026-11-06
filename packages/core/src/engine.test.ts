import { describe, it, expect } from "vitest";
import { buildKnowledge } from "./engine.js";

describe("buildKnowledge", () => {
  it("parses notes, builds the graph, and skips brainstorming", () => {
    const indexMd = "---\ntitle: Layers\nlayers:\n  - brief\n  - technical\n---\n";
    const notes = [
      {
        path: "technical/refunds.md",
        content:
          '---\ntitle: Refunds\nlayer: technical\nlinks:\n  - type: affects\n    target: "[[endpoint]]"\n---\nRefunds write to the ledger first.\n',
      },
      {
        path: "prototypes/endpoint.md",
        content: "---\ntitle: Endpoint\nlayer: prototypes\n---\nPOST /refunds.\n",
      },
      {
        path: "ai/ideas.md",
        content: "---\ntitle: Ideas\ntype: brainstorming\n---\nFree text.\n",
      },
    ];

    const result = buildKnowledge(indexMd, notes);

    expect(result.layers).toEqual(["brief", "technical"]);
    expect(result.notes).toHaveLength(2);
    expect(result.brainstorming).toHaveLength(1);
    expect(result.graph.backlinks.get("prototypes/endpoint")).toContain("technical/refunds");
    expect(result.search.search("ledger")).toHaveLength(1);
  });

  it("flags broken links and unknown layers are left to check", () => {
    const indexMd = "---\ntitle: Layers\nlayers:\n  - brief\n---\n";
    const notes = [
      {
        path: "brief/one.md",
        content: '---\ntitle: One\nlayer: brief\nlinks:\n  - type: relates_to\n    target: "[[missing]]"\n---\nBody.\n',
      },
    ];

    const result = buildKnowledge(indexMd, notes);

    expect(result.graph.brokenLinks).toContain("brief/one -> missing");
  });
});
