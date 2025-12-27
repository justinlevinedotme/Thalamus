import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, Moon, Sun } from "lucide-react";
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  exportGraphPdf,
  exportGraphPng,
  generateExportPreview,
  type ExportFormat,
  type ExportMargin,
  type ExportOptions,
  type ExportQuality,
} from "../../lib/exportImage";
import { useTheme } from "../../lib/theme";

type ExportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
};

const marginOptions: { value: ExportMargin; label: string }[] = [
  { value: "none", label: "None" },
  { value: "small", label: "S" },
  { value: "medium", label: "M" },
  { value: "large", label: "L" },
];

const qualityOptions: { value: ExportQuality; label: string; description: string }[] = [
  { value: "standard", label: "1x", description: "Standard quality" },
  { value: "high", label: "2x", description: "High quality" },
  { value: "ultra", label: "4x", description: "Ultra quality" },
];

type ExportTheme = "light" | "dark";

const themeBackgrounds: Record<ExportTheme, string> = {
  light: "#ffffff",
  dark: "#000000",
};

export default function ExportDialog({
  open,
  onOpenChange,
  title,
  nodes,
  edges,
}: ExportDialogProps) {
  const { resolvedTheme } = useTheme();
  const [format, setFormat] = useState<ExportFormat>("png");
  const [margin, setMargin] = useState<ExportMargin>("small");
  const [quality, setQuality] = useState<ExportQuality>("high");
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [exportTheme, setExportTheme] = useState<ExportTheme>(() =>
    resolvedTheme === "dark" ? "dark" : "light"
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Derive background color from export theme
  const backgroundColor = themeBackgrounds[exportTheme];

  const options: ExportOptions = {
    margin,
    transparentBackground,
    backgroundColor,
    quality,
  };

  const generatePreview = useCallback(async () => {
    if (!open || nodes.length === 0) return;

    setIsGeneratingPreview(true);
    try {
      const dataUrl = await generateExportPreview(nodes, edges, options);
      setPreview(dataUrl);
    } catch (error) {
      console.error("Failed to generate preview:", error);
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [open, nodes, edges, margin, transparentBackground, exportTheme]);

  // Generate preview when dialog opens or options change
  useEffect(() => {
    if (open) {
      const timer = setTimeout(generatePreview, 100);
      return () => clearTimeout(timer);
    }
  }, [open, generatePreview]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === "png") {
        await exportGraphPng(title, nodes, edges, options);
      } else {
        await exportGraphPdf(title, nodes, edges, options);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
        </DialogHeader>

        <TooltipProvider>
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            {/* Preview - Large */}
            <div
              className="relative flex-1 min-h-0 overflow-hidden rounded-lg border border-border"
              style={{
                backgroundColor: transparentBackground ? undefined : backgroundColor,
                backgroundImage: transparentBackground
                  ? "repeating-conic-gradient(#d1d5db 0% 25%, #f1f5f9 0% 50%) 50% / 16px 16px"
                  : undefined,
              }}
            >
              {isGeneratingPreview ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : preview ? (
                <img src={preview} alt="Export preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No preview available
                </div>
              )}
            </div>

            {/* Settings Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {/* Format */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Format</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-border bg-background"
                  value={format}
                  onValueChange={(v) => v && setFormat(v as ExportFormat)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value="png"
                        className="h-full w-12 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                        variant="ghost"
                      >
                        PNG
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>PNG image</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value="pdf"
                        className="h-full w-12 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                        variant="ghost"
                      >
                        PDF
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>PDF document</TooltipContent>
                  </Tooltip>
                </ToggleGroup>
              </div>

              {/* Margin */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Margin</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-border bg-background"
                  value={margin}
                  onValueChange={(v) => v && setMargin(v as ExportMargin)}
                >
                  {marginOptions.map((opt) => (
                    <Tooltip key={opt.value}>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={opt.value}
                          className="h-full w-10 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                          variant="ghost"
                        >
                          {opt.label}
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        {opt.value === "none"
                          ? "No margin"
                          : `${opt.value.charAt(0).toUpperCase() + opt.value.slice(1)} margin`}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </ToggleGroup>
              </div>

              {/* Quality */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Quality</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-border bg-background"
                  value={quality}
                  onValueChange={(v) => v && setQuality(v as ExportQuality)}
                >
                  {qualityOptions.map((opt) => (
                    <Tooltip key={opt.value}>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={opt.value}
                          className="h-full w-10 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                          variant="ghost"
                        >
                          {opt.label}
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent>{opt.description}</TooltipContent>
                    </Tooltip>
                  ))}
                </ToggleGroup>
              </div>

              {/* Theme */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Theme</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-border bg-background"
                  value={exportTheme}
                  onValueChange={(v) => {
                    if (v) {
                      setExportTheme(v as ExportTheme);
                      setTransparentBackground(false);
                    }
                  }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value="light"
                        className="h-full w-10 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                        variant="ghost"
                      >
                        <Sun className="h-3.5 w-3.5" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>Light background</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value="dark"
                        className="h-full w-10 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                        variant="ghost"
                      >
                        <Moon className="h-3.5 w-3.5" />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>Dark background</TooltipContent>
                  </Tooltip>
                </ToggleGroup>
              </div>

              {/* Transparent (PNG only) */}
              {format === "png" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="transparent-bg"
                    checked={transparentBackground}
                    onCheckedChange={(checked) => setTransparentBackground(checked === true)}
                  />
                  <label
                    htmlFor="transparent-bg"
                    className="cursor-pointer text-xs text-muted-foreground"
                  >
                    Transparent
                  </label>
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
