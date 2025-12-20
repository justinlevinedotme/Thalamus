import EditorToolbar from "../features/editor/EditorToolbar";
import GraphCanvas from "../features/editor/GraphCanvas";
import RelationshipInspector from "../features/editor/RelationshipInspector";

export default function EditorRoute() {
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <EditorToolbar />
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <section className="flex-1 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <GraphCanvas />
        </section>
        <aside className="w-80 shrink-0">
          <RelationshipInspector />
        </aside>
      </div>
    </div>
  );
}
