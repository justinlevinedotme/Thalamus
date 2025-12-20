import { useState } from "react";

import { Input } from "../../components/ui/input";
import { exportGraphPdf, exportGraphPng } from "../../lib/exportImage";
import { exportGraphJson } from "../../lib/exportJson";
import { useGraphStore } from "../../store/graphStore";

export default function EditorToolbar() {
  const { graphTitle, setGraphTitle, nodes, edges } = useGraphStore();
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);

  const handleExportJson = () => {
    exportGraphJson(graphTitle, nodes, edges);
  };

  const handleExportImage = async (format: "png" | "pdf") => {
    try {
      setExporting(format);
      if (format === "png") {
        await exportGraphPng(graphTitle);
      } else {
        await exportGraphPdf(graphTitle);
      }
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setExporting(null);
    }
  };

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
          onClick={handleExportJson}
        >
          Export JSON
        </button>
        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          type="button"
          onClick={() => handleExportImage("png")}
          disabled={exporting === "png"}
        >
          {exporting === "png" ? "Exporting..." : "Export PNG"}
        </button>
        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          type="button"
          onClick={() => handleExportImage("pdf")}
          disabled={exporting === "pdf"}
        >
          {exporting === "pdf" ? "Exporting..." : "Export PDF"}
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
