import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Download, Redo2, Undo2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { exportGraphPdf, exportGraphPng } from "../../lib/exportImage";
import { exportGraphJson } from "../../lib/exportJson";
import { useGraphStore } from "../../store/graphStore";

type EditorToolbarProps = {
  canSave: boolean;
  onSave: () => Promise<void>;
  onShare: () => void;
  saveStatus?: "idle" | "saving" | "saved" | "error";
};

export default function EditorToolbar({
  canSave,
  onSave,
  onShare,
  saveStatus = "idle",
}: EditorToolbarProps) {
  const {
    graphTitle,
    setGraphTitle,
    nodes,
    edges,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useGraphStore();
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
        {/* Undo/Redo button group */}
        <div className="flex overflow-hidden rounded-md border border-slate-200">
          <button
            className="flex h-8 w-8 items-center justify-center border-r border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo last change"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo last change"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              type="button"
              disabled={exporting !== null}
              aria-label="Export graph"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export"}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportJson}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportImage("png")}>
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportImage("pdf")}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
          type="button"
          onClick={onSave}
          disabled={!canSave || saveStatus === "saving"}
          aria-label="Save graph"
        >
          {saveStatus === "saving" ? "Saving..." : "Save"}
        </button>
        <button
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
          type="button"
          onClick={onShare}
          disabled={!canSave}
          aria-label="Share graph"
        >
          Share
        </button>
        {!canSave ? (
          <Link className="text-xs text-slate-500 underline" to="/login">
            Sign in to save
          </Link>
        ) : null}
      </div>
    </header>
  );
}
