import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { useGraphStore } from "../../store/graphStore";

const getNodeLabel = (node: { data?: { label?: string } }) => node.data?.label ?? "Untitled";

export default function NodeSearch() {
  const [query, setQuery] = useState("");
  const { nodes, selectedNodeId, selectNode } = useGraphStore();

  const filteredNodes = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return [];
    }
    return nodes.filter((node) => getNodeLabel(node).toLowerCase().includes(term)).slice(0, 6);
  }, [nodes, query]);

  const handleSelect = (nodeId: string) => {
    selectNode(nodeId);
  };

  return (
    <div>
      {/* Search input - Spotlight style */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          className="flex-1 bg-transparent text-lg outline-none placeholder:text-slate-400"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search nodes..."
          autoFocus
        />
      </div>

      {/* Results */}
      {query.trim().length === 0 ? (
        <div className="px-4 py-3 text-sm text-slate-500">Type to search nodes...</div>
      ) : filteredNodes.length === 0 ? (
        <div className="px-4 py-3 text-sm text-slate-500">No matches found</div>
      ) : (
        <div className="max-h-64 overflow-y-auto py-1">
          {filteredNodes.map((node) => (
            <button
              key={node.id}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={() => handleSelect(node.id)}
              aria-label={`Select ${getNodeLabel(node)}`}
            >
              <span className="truncate">{getNodeLabel(node)}</span>
              {node.id === selectedNodeId ? (
                <span className="text-xs text-slate-400">Selected</span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
