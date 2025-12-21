import { type DragEvent } from "react";

import { type NodeKind, useGraphStore } from "../../store/graphStore";

const nodeKinds: Array<{
  kind: NodeKind;
  label: string;
  description: string;
}> = [
  { kind: "idea", label: "Idea", description: "Capture a thought" },
  { kind: "question", label: "Question", description: "Add an open prompt" },
  { kind: "evidence", label: "Evidence", description: "Support or proof" },
  { kind: "goal", label: "Goal", description: "A desired outcome" },
];

export default function NodeLibrary() {
  const { addNodeAtCenter } = useGraphStore();

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, kind: NodeKind) => {
    event.dataTransfer.setData("application/reactflow", kind);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <header>
        <h2 className="text-sm font-semibold text-slate-700">Node library</h2>
        <p className="text-xs text-slate-500">
          Drag onto the canvas or click to add.
        </p>
      </header>

      <div className="space-y-2">
        {nodeKinds.map((node) => (
          <button
            key={node.kind}
            className="flex w-full items-start justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            type="button"
            draggable
            onDragStart={(event) => handleDragStart(event, node.kind)}
            onClick={() => addNodeAtCenter(node.kind)}
            aria-label={`Add ${node.label} node`}
          >
            <div>
              <div className="text-sm font-semibold text-slate-700">{node.label}</div>
              <div className="text-[11px] text-slate-500">{node.description}</div>
            </div>
            <span className="mt-1 text-[10px] uppercase text-slate-400">
              {node.kind}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
