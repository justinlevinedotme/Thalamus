import { Input } from "../../components/ui/input";
import { useGraphStore } from "../../store/graphStore";

export default function EditorToolbar() {
  const { graphTitle, setGraphTitle } = useGraphStore();

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="min-w-[220px] flex-1">
        <Input
          value={graphTitle}
          onChange={(event) => setGraphTitle(event.target.value)}
          placeholder="Untitled Graph"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          type="button"
        >
          Export
        </button>
        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          type="button"
        >
          Save
        </button>
        <button
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-800"
          type="button"
        >
          Share
        </button>
      </div>
    </header>
  );
}
