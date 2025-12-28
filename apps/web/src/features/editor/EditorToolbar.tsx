import { useState } from "react";
import { Download, FileJson, Image, Redo2, Undo2 } from "lucide-react";

import Header from "../../components/Header";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "../../components/ui/menubar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { exportGraphJson } from "../../lib/exportJson";
import { useGraphStore } from "../../store/graphStore";
import ExportDialog from "./ExportDialog";

type EditorToolbarProps = {
  canSave: boolean;
  onSave: () => Promise<void>;
  onShare: () => void;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  lastSavedAt?: Date | null;
};

function formatLastSaved(date: Date | null | undefined): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return "Saved just now";
  if (diffSec < 60) return "Saved a few seconds ago";
  if (diffMin === 1) return "Saved 1 minute ago";
  if (diffMin < 60) return `Saved ${diffMin} minutes ago`;
  if (diffHour === 1) return "Saved 1 hour ago";
  if (diffHour < 24) return `Saved ${diffHour} hours ago`;
  return `Saved ${date.toLocaleDateString()}`;
}

export default function EditorToolbar({
  canSave,
  onSave,
  onShare,
  saveStatus = "idle",
  lastSavedAt,
}: EditorToolbarProps) {
  const { graphTitle, setGraphTitle, nodes, edges, undo, redo, canUndo, canRedo } = useGraphStore();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const isMac =
    typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const handleExportJson = () => {
    exportGraphJson(graphTitle, nodes, edges);
  };

  return (
    <div className="border-b border-border bg-background">
      {/* Top nav bar - consistent with other pages */}
      <Header fullWidth onShare={onShare}>
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
      <div className="flex items-center gap-2 border-t border-border px-4 py-1">
        <Menubar className="h-auto border-0 bg-transparent p-0">
          <MenubarMenu>
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={onSave} disabled={!canSave || saveStatus === "saving"}>
                {saveStatus === "saving" ? "Saving..." : "Save"}
                <MenubarShortcut>{isMac ? "⌘S" : "Ctrl+S"}</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleExportJson}>Export as JSON</MenubarItem>
              <MenubarItem onClick={() => setExportDialogOpen(true)}>
                Export as Image...
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={onShare} disabled={!canSave}>
                Share
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">Edit</MenubarTrigger>
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
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">View</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>Zoom In</MenubarItem>
              <MenubarItem disabled>Zoom Out</MenubarItem>
              <MenubarItem disabled>Fit to Screen</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-1 text-sm font-normal">Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled>Keyboard Shortcuts</MenubarItem>
              <MenubarItem disabled>Documentation</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="ml-auto flex items-center gap-3">
          {saveStatus === "saving" ? (
            <span className="text-xs text-muted-foreground">Saving...</span>
          ) : lastSavedAt ? (
            <span className="text-xs text-muted-foreground">{formatLastSaved(lastSavedAt)}</span>
          ) : null}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
                  type="button"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
                  type="button"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
            <div className="mx-1 h-4 w-px bg-border" />
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-secondary disabled:opacity-50"
                      type="button"
                      aria-label="Export"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportJson}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>
                  <Image className="mr-2 h-4 w-4" />
                  Export as Image...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        title={graphTitle}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}
