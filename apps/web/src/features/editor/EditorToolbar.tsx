import { useState } from "react";
import { Redo2, Undo2 } from "lucide-react";

import Header from "../../components/Header";
import { Input } from "../../components/ui/input";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "../../components/ui/menubar";
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

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

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
    <div className="border-b border-slate-200 bg-white">
      {/* Top nav bar - consistent with other pages */}
      <Header>
        <div className="ml-4 min-w-[200px] max-w-md flex-1">
          <Input
            value={graphTitle}
            onChange={(event) => setGraphTitle(event.target.value)}
            placeholder="Untitled Graph"
            className="h-8 text-sm"
          />
        </div>
      </Header>

      {/* Menubar - Google Docs style */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-1">
        <Menubar className="h-auto border-0 bg-transparent p-0">
          <MenubarMenu>
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">
              File
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                onClick={onSave}
                disabled={!canSave || saveStatus === "saving"}
              >
                {saveStatus === "saving" ? "Saving..." : "Save"}
                <MenubarShortcut>{isMac ? "⌘S" : "Ctrl+S"}</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleExportJson} disabled={exporting !== null}>
                Export as JSON
              </MenubarItem>
              <MenubarItem
                onClick={() => handleExportImage("png")}
                disabled={exporting !== null}
              >
                Export as PNG
              </MenubarItem>
              <MenubarItem
                onClick={() => handleExportImage("pdf")}
                disabled={exporting !== null}
              >
                Export as PDF
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onShare} disabled={!canSave}>
                Share
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">
              Edit
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={undo} disabled={!canUndo}>
                Undo
                <MenubarShortcut>{isMac ? "⌘Z" : "Ctrl+Z"}</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={redo} disabled={!canRedo}>
                Redo
                <MenubarShortcut>{isMac ? "⌘⇧Z" : "Ctrl+Y"}</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">
              View
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>Zoom In</MenubarItem>
              <MenubarItem disabled>Zoom Out</MenubarItem>
              <MenubarItem disabled>Fit to Screen</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">
              Help
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>Keyboard Shortcuts</MenubarItem>
              <MenubarItem disabled>Documentation</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            type="button"
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            type="button"
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
