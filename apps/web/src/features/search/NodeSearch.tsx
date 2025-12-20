import { useMemo, useState } from "react";

import { Input } from "../../components/ui/input";
import { useGraphStore } from "../../store/graphStore";

const getNodeLabel = (node: { data?: { label?: string } }) =>
  node.data?.label ?? "Untitled";

export default function NodeSearch() {
  const [query, setQuery] = useState("");
  const {
    nodes,
    selectedNodeId,
    selectNode,
    isFocusMode,
    focusNodeId,
    setFocusNode,
    clearFocus,
  } = useGraphStore();

  const filteredNodes = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return [];
    }
    return nodes
      .filter((node) => getNodeLabel(node).toLowerCase().includes(term))
      .slice(0, 6);
  }, [nodes, query]);

  const focusLabel = useMemo(() => {
    if (!focusNodeId) {
      return "";
    }
    const focusNode = nodes.find((node) => node.id === focusNodeId);
    return focusNode ? getNodeLabel(focusNode) : "";
  }, [focusNodeId, nodes]);

  const handleSelect = (nodeId: string) => {
    selectNode(nodeId);
    if (isFocusMode) {
      setFocusNode(nodeId);
    }
  };

  const handleFocusToggle = () => {
    if (isFocusMode) {
      clearFocus();
      return;
    }
    if (selectedNodeId) {
      setFocusNode(selectedNodeId);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Search</h2>
        <button
          className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={handleFocusToggle}
          disabled={!selectedNodeId && !isFocusMode}
        >
          {isFocusMode ? "Exit focus" : "Focus"}
        </button>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find a node"
      />

      {query.trim().length === 0 ? (
        <p className="text-xs text-slate-500">
          Search by node label to jump to key ideas.
        </p>
      ) : filteredNodes.length === 0 ? (
        <p className="text-xs text-slate-500">No matches.</p>
      ) : (
        <div className="space-y-1">
          {filteredNodes.map((node) => (
            <button
              key={node.id}
              className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs text-slate-600 transition hover:bg-slate-50"
              type="button"
              onClick={() => handleSelect(node.id)}
            >
              <span className="truncate">{getNodeLabel(node)}</span>
              {node.id === selectedNodeId ? (
                <span className="text-[10px] uppercase text-slate-400">
                  Selected
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}

      {isFocusMode ? (
        <p className="text-xs text-slate-500">
          Focused on {focusLabel || "selected node"}.
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Focus isolates connected ideas to reduce overload.
        </p>
      )}
    </div>
  );
}
