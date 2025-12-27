import { useCallback, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "reactflow";

import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { ColorPicker, ColorSwatch } from "../../components/ui/color-picker";
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

const backgroundPresets = [
  { color: "#ffffff", label: "White" },
  { color: "#f8fafc", label: "Slate 50" },
  { color: "#f1f5f9", label: "Slate 100" },
  { color: "#1e293b", label: "Slate 800" },
  { color: "#0f172a", label: "Slate 900" },
];

export default function ExportDialog({
  open,
  onOpenChange,
  title,
  nodes,
  edges,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [margin, setMargin] = useState<ExportMargin>("small");
  const [quality, setQuality] = useState<ExportQuality>("high");
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [preview, setPreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
  }, [open, nodes, edges, margin, transparentBackground, backgroundColor]);

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
              className="relative flex-1 min-h-0 overflow-hidden rounded-lg border border-slate-200"
              style={{
                backgroundColor: transparentBackground ? undefined : backgroundColor,
                backgroundImage: transparentBackground
                  ? "repeating-conic-gradient(#d1d5db 0% 25%, #f1f5f9 0% 50%) 50% / 16px 16px"
                  : undefined,
              }}
            >
              {isGeneratingPreview ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : preview ? (
                <img src={preview} alt="Export preview" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No preview available
                </div>
              )}
            </div>

            {/* Settings Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {/* Format */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Format</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-slate-200 bg-white"
                  value={format}
                  onValueChange={(v) => v && setFormat(v as ExportFormat)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value="png"
                        className="h-full w-12 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900"
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
                        className="h-full w-12 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900"
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
                <label className="text-xs text-slate-500">Margin</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-slate-200 bg-white"
                  value={margin}
                  onValueChange={(v) => v && setMargin(v as ExportMargin)}
                >
                  {marginOptions.map((opt) => (
                    <Tooltip key={opt.value}>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={opt.value}
                          className="h-full w-10 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900"
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
                <label className="text-xs text-slate-500">Quality</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-slate-200 bg-white"
                  value={quality}
                  onValueChange={(v) => v && setQuality(v as ExportQuality)}
                >
                  {qualityOptions.map((opt) => (
                    <Tooltip key={opt.value}>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={opt.value}
                          className="h-full w-10 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900"
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

              {/* Background */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Background</label>
                <div className="flex h-7 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1">
                  {backgroundPresets.map((preset) => (
                    <Tooltip key={preset.color}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setBackgroundColor(preset.color);
                            setTransparentBackground(false);
                          }}
                          className={`h-5 w-5 rounded transition ${
                            !transparentBackground && backgroundColor === preset.color
                              ? "ring-2 ring-slate-900 ring-offset-1"
                              : "hover:ring-1 hover:ring-slate-400"
                          }`}
                          style={{ backgroundColor: preset.color }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{preset.label}</TooltipContent>
                    </Tooltip>
                  ))}
                  <ColorPicker
                    value={backgroundColor}
                    onChange={(color) => {
                      setBackgroundColor(color);
                      setTransparentBackground(false);
                    }}
                    showAlpha={false}
                  >
                    <button
                      type="button"
                      className={`ml-0.5 h-5 w-5 rounded transition ${
                        !transparentBackground &&
                        !backgroundPresets.some((p) => p.color === backgroundColor)
                          ? "ring-2 ring-slate-900 ring-offset-1"
                          : "hover:ring-1 hover:ring-slate-400"
                      }`}
                      title="Custom color"
                    >
                      <ColorSwatch color={backgroundColor} className="h-full w-full rounded" />
                    </button>
                  </ColorPicker>
                </div>
              </div>

              {/* Transparent (PNG only) */}
              {format === "png" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="transparent-bg"
                    checked={transparentBackground}
                    onCheckedChange={(checked) => setTransparentBackground(checked === true)}
                  />
                  <label htmlFor="transparent-bg" className="cursor-pointer text-xs text-slate-500">
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
