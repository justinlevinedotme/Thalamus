import { Plus } from "lucide-react";
import { type DragEvent } from "react";

import { useGraphStore } from "../../store/graphStore";

export default function NodeLibrary() {
  const { addNodeAtCenter } = useGraphStore();

  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData("application/reactflow", "idea");
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <button
        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        type="button"
        draggable
        onDragStart={handleDragStart}
        onClick={() => addNodeAtCenter("idea")}
        aria-label="Add node"
      >
        <Plus className="h-4 w-4" />
        Add Node
      </button>
    </section>
  );
}
