import { useMemo, type ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { ColorPicker, ColorSwatch } from "../../components/ui/color-picker";
import { IconPicker, NodeIconDisplay } from "../../components/ui/icon-picker";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Smile } from "lucide-react";
import {
  type EdgePadding,
  type NodeBorderStyle,
  type NodeShape,
  type NodeSize,
  type NodeStyle,
  useGraphStore,
} from "../../store/graphStore";

// Helper to check if all values in an array are the same
function allSame<T>(values: T[]): boolean {
  if (values.length === 0) return true;
  return values.every((v) => v === values[0]);
}

// Helper to get common value or undefined if mixed
function getCommonValue<T>(values: T[]): T | undefined {
  if (values.length === 0) return undefined;
  return allSame(values) ? values[0] : undefined;
}

const edgePaddings: Array<{ value: EdgePadding; label: string }> = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const nodeShapes: Array<{ value: NodeShape; label: string; icon: ReactNode }> = [
  {
    value: "rounded",
    label: "Rounded",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="8" rx="2" />
      </svg>
    ),
  },
  {
    value: "pill",
    label: "Pill",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="8" rx="4" />
      </svg>
    ),
  },
  {
    value: "circle",
    label: "Circle",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="5" />
      </svg>
    ),
  },
  {
    value: "square",
    label: "Square",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="10" height="8" />
      </svg>
    ),
  },
];

const nodeSizes: Array<{ value: NodeSize; label: string }> = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const borderStyles: Array<{ value: NodeBorderStyle; label: string; icon: ReactNode }> = [
  {
    value: "solid",
    label: "Solid",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
  {
    value: "dashed",
    label: "Dashed",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2">
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
  {
    value: "dotted",
    label: "Dotted",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1 2" strokeLinecap="round">
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
];

const borderWidths: Array<{ value: number; label: string }> = [
  { value: 1, label: "Thin" },
  { value: 2, label: "Regular" },
  { value: 3, label: "Medium" },
  { value: 4, label: "Thick" },
];

export default function NodeStyleInspector() {
  const {
    nodes,
    updateNodeStyle,
    updateNodeHandles,
    updateSelectedNodesStyle,
  } = useGraphStore();

  // Get all selected nodes from React Flow's selection state
  const selectedNodes = useMemo(
    () => nodes.filter((node) => node.selected),
    [nodes]
  );

  const isMultiSelect = selectedNodes.length > 1;
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  // Check if we're dealing with text nodes (headings)
  const isTextNode = selectedNode?.data?.kind === "text";
  const isShapeNode = selectedNode?.data?.kind === "shape";
  const isKeyNode = selectedNode?.data?.kind === "pathKey" || selectedNode?.data?.kind === "nodeKey";
  // For multi-select, check if all selected are text/shape/key nodes
  const allTextNodes = selectedNodes.length > 0 && selectedNodes.every((n) => n.data?.kind === "text");
  const allShapeNodes = selectedNodes.length > 0 && selectedNodes.every((n) => n.data?.kind === "shape");
  const allKeyNodes = selectedNodes.length > 0 && selectedNodes.every((n) => n.data?.kind === "pathKey" || n.data?.kind === "nodeKey");

  // For multi-selection, compute common values
  const commonStyles = useMemo(() => {
    if (selectedNodes.length === 0) return null;
    const styles = selectedNodes.map((n) => n.data?.style);
    return {
      color: getCommonValue(styles.map((s) => s?.color)),
      shape: getCommonValue(styles.map((s) => s?.shape)),
      size: getCommonValue(styles.map((s) => s?.size)),
      edgePadding: getCommonValue(styles.map((s) => s?.edgePadding)),
      textColor: getCommonValue(styles.map((s) => s?.textColor)),
      bodyTextColor: getCommonValue(styles.map((s) => s?.bodyTextColor)),
      icon: getCommonValue(styles.map((s) => JSON.stringify(s?.icon))),
      iconColor: getCommonValue(styles.map((s) => s?.iconColor)),
      borderColor: getCommonValue(styles.map((s) => s?.borderColor)),
      borderWidth: getCommonValue(styles.map((s) => s?.borderWidth)),
      borderStyle: getCommonValue(styles.map((s) => s?.borderStyle)),
    };
  }, [selectedNodes]);

  const sourceHandleCount = selectedNode?.data?.sourceHandles?.length ?? 1;
  const targetHandleCount = selectedNode?.data?.targetHandles?.length ?? 1;

  // Style update handler - uses batch update for multi-select
  const handleStyleUpdate = (style: Partial<NodeStyle>) => {
    if (isMultiSelect) {
      updateSelectedNodesStyle(style);
    } else if (selectedNode) {
      updateNodeStyle(selectedNode.id, style);
    }
  };

  if (selectedNodes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Select a node to edit its type and style.
      </div>
    );
  }

  // Get current style values - use common styles for multi-select, single node styles for single select
  const currentColor = isMultiSelect ? commonStyles?.color : selectedNode?.data?.style?.color;
  const currentShape = isMultiSelect ? commonStyles?.shape : selectedNode?.data?.style?.shape;
  const currentSize = isMultiSelect ? commonStyles?.size : selectedNode?.data?.style?.size;
  const currentEdgePadding = isMultiSelect ? commonStyles?.edgePadding : selectedNode?.data?.style?.edgePadding;
  const currentTextColor = isMultiSelect ? commonStyles?.textColor : selectedNode?.data?.style?.textColor;
  const currentBodyTextColor = isMultiSelect ? commonStyles?.bodyTextColor : selectedNode?.data?.style?.bodyTextColor;
  const currentIconColor = isMultiSelect ? commonStyles?.iconColor : selectedNode?.data?.style?.iconColor;
  const currentBorderColor = isMultiSelect ? commonStyles?.borderColor : selectedNode?.data?.style?.borderColor;
  const currentBorderWidth = isMultiSelect ? commonStyles?.borderWidth : selectedNode?.data?.style?.borderWidth;
  const currentBorderStyle = isMultiSelect ? commonStyles?.borderStyle : selectedNode?.data?.style?.borderStyle;

  // For icon, we need to parse the JSON back
  const currentIcon = isMultiSelect
    ? (commonStyles?.icon ? JSON.parse(commonStyles.icon) : undefined)
    : selectedNode?.data?.style?.icon;

  // Determine header text
  const getHeaderText = () => {
    if (isMultiSelect) {
      return `${selectedNodes.length} nodes selected`;
    }
    if (isTextNode) return "Text Style";
    if (isShapeNode) return "Shape Style";
    if (isKeyNode) return "Key Style";
    return "Node Style";
  };

  // Should show handles section (not for text/shape/key nodes)
  const showHandles = !isMultiSelect && selectedNode && !isTextNode && !isShapeNode && !isKeyNode;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <h2 className="px-3 pt-3 text-sm font-semibold text-slate-700">
          {getHeaderText()}
        </h2>

        {/* Handles - only show for single selection of regular nodes */}
        {showHandles && (
          <div className="space-y-3 px-3 py-3">
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-semibold uppercase text-slate-500">Inputs</label>
              <div className="flex items-center gap-1">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-l-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  type="button"
                  onClick={() =>
                    updateNodeHandles(
                      selectedNode.id,
                      sourceHandleCount,
                      Math.max(0, targetHandleCount - 1)
                    )
                  }
                  disabled={targetHandleCount <= 0}
                  aria-label="Decrease input handles"
                >
                  −
                </button>
                <span className="flex h-7 w-8 items-center justify-center border-y border-slate-200 bg-white text-xs text-slate-700">
                  {targetHandleCount}
                </span>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-r-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  type="button"
                  onClick={() =>
                    updateNodeHandles(
                      selectedNode.id,
                      sourceHandleCount,
                      Math.min(8, targetHandleCount + 1)
                    )
                  }
                  disabled={targetHandleCount >= 8}
                  aria-label="Increase input handles"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-semibold uppercase text-slate-500">Outputs</label>
              <div className="flex items-center gap-1">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-l-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  type="button"
                  onClick={() =>
                    updateNodeHandles(
                      selectedNode.id,
                      Math.max(0, sourceHandleCount - 1),
                      targetHandleCount
                    )
                  }
                  disabled={sourceHandleCount <= 0}
                  aria-label="Decrease output handles"
                >
                  −
                </button>
                <span className="flex h-7 w-8 items-center justify-center border-y border-slate-200 bg-white text-xs text-slate-700">
                  {sourceHandleCount}
                </span>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-r-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                  type="button"
                  onClick={() =>
                    updateNodeHandles(
                      selectedNode.id,
                      Math.min(8, sourceHandleCount + 1),
                      targetHandleCount
                    )
                  }
                  disabled={sourceHandleCount >= 8}
                  aria-label="Increase output handles"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-xs font-semibold uppercase text-slate-500">Icon</label>
              <div className="flex items-center gap-1">
                <IconPicker
                  value={currentIcon}
                  onChange={(icon) => handleStyleUpdate({ icon })}
                >
                  <button
                    type="button"
                    className="flex h-7 min-w-[3.5rem] items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-base hover:bg-slate-50"
                    style={{ color: currentIconColor ?? "#1e293b" }}
                  >
                    {currentIcon ? (
                      <NodeIconDisplay icon={currentIcon} className="h-4 w-4" />
                    ) : (
                      <Smile className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </IconPicker>
                {currentIcon && currentIcon.type !== "emoji" && (
                  <ColorPicker
                    value={currentIconColor ?? "#1e293b"}
                    onChange={(color) => handleStyleUpdate({ iconColor: color })}
                  >
                    <button
                      type="button"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center"
                      title="Icon color"
                    >
                      <ColorSwatch
                        color={currentIconColor ?? "#1e293b"}
                        className="h-5 w-5"
                      />
                    </button>
                  </ColorPicker>
                )}
                {currentIcon && (
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    type="button"
                    onClick={() => handleStyleUpdate({ icon: undefined, iconColor: undefined })}
                    aria-label="Clear icon"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multi-select info message */}
        {isMultiSelect && (
          <div className="px-3 py-2 text-xs text-slate-500">
            Style changes apply to all selected nodes
          </div>
        )}

        {/* Text node simplified controls - just color, size, icon */}
        {(isTextNode || allTextNodes) ? (
          <div className="space-y-3 px-3 py-3 border-t border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <label className="text-xs text-slate-500">Color</label>
              <ColorPicker
                value={currentTextColor ?? "#1e293b"}
                onChange={(color) => handleStyleUpdate({ textColor: color })}
              >
                <button
                  type="button"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center"
                  title="Text color"
                >
                  {currentTextColor ? (
                    <ColorSwatch color={currentTextColor} className="h-5 w-5" />
                  ) : (
                    <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                  )}
                </button>
              </ColorPicker>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-xs text-slate-500">Size</label>
              <ToggleGroup
                type="single"
                className="h-7 rounded-md border border-slate-200 bg-white"
                value={currentSize ?? ""}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }
                  handleStyleUpdate({ size: value as NodeSize });
                }}
                aria-label="Text size"
              >
                {nodeSizes.map((size) => (
                  <Tooltip key={size.value}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        value={size.value}
                        className="h-full w-10 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                        variant="ghost"
                      >
                        {size.value.toUpperCase()}
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{size.label}</TooltipContent>
                  </Tooltip>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-xs text-slate-500">Icon</label>
              <div className="flex items-center gap-1">
                <IconPicker
                  value={currentIcon}
                  onChange={(icon) => handleStyleUpdate({ icon })}
                >
                  <button
                    type="button"
                    className="flex h-7 min-w-[3.5rem] items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-base hover:bg-slate-50"
                    style={{ color: currentIconColor ?? "#1e293b" }}
                  >
                    {currentIcon ? (
                      <NodeIconDisplay icon={currentIcon} className="h-4 w-4" />
                    ) : (
                      <Smile className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </IconPicker>
                {currentIcon && currentIcon.type !== "emoji" && (
                  <ColorPicker
                    value={currentIconColor ?? "#1e293b"}
                    onChange={(color) => handleStyleUpdate({ iconColor: color })}
                  >
                    <button
                      type="button"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center"
                      title="Icon color"
                    >
                      <ColorSwatch
                        color={currentIconColor ?? "#1e293b"}
                        className="h-5 w-5"
                      />
                    </button>
                  </ColorPicker>
                )}
                {currentIcon && (
                  <button
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    type="button"
                    onClick={() => handleStyleUpdate({ icon: undefined, iconColor: undefined })}
                    aria-label="Clear icon"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (isKeyNode || allKeyNodes) ? (
          /* Key node controls - background, border, title color, body color, separator/icon color, icon */
          <Accordion type="single" collapsible defaultValue="appearance" className="w-full">
            <AccordionItem value="appearance" className="border-b-0 border-t border-slate-200">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-600 hover:no-underline hover:bg-slate-50">
                Appearance
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Background</label>
                    <ColorPicker
                      value={currentColor ?? "#FFFFFF"}
                      onChange={(color) => handleStyleUpdate({ color })}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center"
                        title="Background color"
                      >
                        {currentColor ? (
                          <ColorSwatch color={currentColor} className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                        )}
                      </button>
                    </ColorPicker>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Border</label>
                    <ColorPicker
                      value={currentBorderColor ?? "#e2e8f0"}
                      onChange={(color) => handleStyleUpdate({ borderColor: color })}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center"
                        title="Border color"
                      >
                        {currentBorderColor ? (
                          <ColorSwatch color={currentBorderColor} className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                        )}
                      </button>
                    </ColorPicker>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="text" className="border-b-0 border-t border-slate-200">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-600 hover:no-underline hover:bg-slate-50">
                Text & Icon
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Title</label>
                    <ColorPicker
                      value={currentTextColor ?? "#334155"}
                      onChange={(color) => handleStyleUpdate({ textColor: color })}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center"
                        title="Title color"
                      >
                        {currentTextColor ? (
                          <ColorSwatch color={currentTextColor} className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                        )}
                      </button>
                    </ColorPicker>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Body</label>
                    <ColorPicker
                      value={currentBodyTextColor ?? "#64748b"}
                      onChange={(color) => handleStyleUpdate({ bodyTextColor: color })}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center"
                        title="Body text color"
                      >
                        {currentBodyTextColor ? (
                          <ColorSwatch color={currentBodyTextColor} className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                        )}
                      </button>
                    </ColorPicker>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Separator</label>
                    <ColorPicker
                      value={currentIconColor ?? "#e2e8f0"}
                      onChange={(color) => handleStyleUpdate({ iconColor: color })}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center"
                        title="Separator & icon color"
                      >
                        {currentIconColor ? (
                          <ColorSwatch color={currentIconColor} className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                        )}
                      </button>
                    </ColorPicker>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Icon</label>
                    <div className="flex items-center gap-1">
                      <IconPicker
                        value={currentIcon}
                        onChange={(icon) => handleStyleUpdate({ icon })}
                      >
                        <button
                          type="button"
                          className="flex h-7 min-w-[3.5rem] items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-base hover:bg-slate-50"
                          style={{ color: currentIconColor ?? "#e2e8f0" }}
                        >
                          {currentIcon ? (
                            <NodeIconDisplay icon={currentIcon} className="h-4 w-4" />
                          ) : (
                            <Smile className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </IconPicker>
                      {currentIcon && (
                        <button
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                          type="button"
                          onClick={() => handleStyleUpdate({ icon: undefined })}
                          aria-label="Clear icon"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          /* Regular node controls */
          <Accordion type="single" collapsible defaultValue="appearance" className="w-full">
            <AccordionItem value="appearance" className="border-b-0 border-t border-slate-200">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-600 hover:no-underline hover:bg-slate-50">
                Appearance
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Background</label>
                    <ColorPicker
                      value={currentColor ?? "#E2E8F0"}
                      onChange={(color) => handleStyleUpdate({ color })}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 cursor-pointer items-center justify-center"
                        title="Background color"
                      >
                        {currentColor ? (
                          <ColorSwatch color={currentColor} className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                        )}
                      </button>
                    </ColorPicker>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Shape</label>
                    <ToggleGroup
                      type="single"
                      className="h-7 rounded-md border border-slate-200 bg-white"
                      value={currentShape ?? ""}
                      onValueChange={(value) => {
                        if (!value) {
                          return;
                        }
                        handleStyleUpdate({ shape: value as NodeShape });
                      }}
                      aria-label="Node shape"
                    >
                      {nodeShapes.map((shape) => (
                        <Tooltip key={shape.value}>
                          <TooltipTrigger asChild>
                            <ToggleGroupItem
                              value={shape.value}
                              className="h-full w-8 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                              variant="ghost"
                            >
                              {shape.icon}
                            </ToggleGroupItem>
                          </TooltipTrigger>
                          <TooltipContent>{shape.label}</TooltipContent>
                        </Tooltip>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-slate-500">Size</label>
                    <ToggleGroup
                      type="single"
                      className="h-7 rounded-md border border-slate-200 bg-white"
                      value={currentSize ?? ""}
                      onValueChange={(value) => {
                        if (!value) {
                          return;
                        }
                        handleStyleUpdate({ size: value as NodeSize });
                      }}
                      aria-label="Node size"
                    >
                      {nodeSizes.map((size) => (
                        <Tooltip key={size.value}>
                          <TooltipTrigger asChild>
                            <ToggleGroupItem
                              value={size.value}
                              className="h-full w-10 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                              variant="ghost"
                            >
                              {size.value.toUpperCase()}
                            </ToggleGroupItem>
                          </TooltipTrigger>
                          <TooltipContent>{size.label}</TooltipContent>
                        </Tooltip>
                      ))}
                    </ToggleGroup>
                  </div>

                  {/* Edge padding - hide for shape and key nodes */}
                  {!isShapeNode && !allShapeNodes && !isKeyNode && !allKeyNodes && (
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-xs text-slate-500">Edge Padding</label>
                      <ToggleGroup
                        type="single"
                        className="h-7 rounded-md border border-slate-200 bg-white"
                        value={currentEdgePadding ?? ""}
                        onValueChange={(value) => {
                          if (!value) {
                            return;
                          }
                          handleStyleUpdate({ edgePadding: value as EdgePadding });
                        }}
                        aria-label="Edge padding"
                      >
                        {edgePaddings.map((padding) => (
                          <Tooltip key={padding.value}>
                            <TooltipTrigger asChild>
                              <ToggleGroupItem
                                value={padding.value}
                                className="h-full w-10 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                                variant="ghost"
                              >
                                {padding.value === "none" ? "0" : padding.value.toUpperCase()}
                              </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>{padding.label}</TooltipContent>
                          </Tooltip>
                        ))}
                      </ToggleGroup>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Text section - hide for shape and key nodes */}
            {!isShapeNode && !allShapeNodes && !isKeyNode && !allKeyNodes && (
              <AccordionItem value="text" className="border-b-0 border-t border-slate-200">
                <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-600 hover:no-underline hover:bg-slate-50">
                  Text
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-xs text-slate-500">Title</label>
                      <ColorPicker
                        value={currentTextColor ?? "#1e293b"}
                        onChange={(color) => handleStyleUpdate({ textColor: color })}
                      >
                        <button
                          type="button"
                          className="flex h-7 w-7 cursor-pointer items-center justify-center"
                          title="Title color"
                        >
                          {currentTextColor ? (
                            <ColorSwatch color={currentTextColor} className="h-5 w-5" />
                          ) : (
                            <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                          )}
                        </button>
                      </ColorPicker>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <label className="text-xs text-slate-500">Body</label>
                      <ColorPicker
                        value={currentBodyTextColor ?? currentTextColor ?? "#475569"}
                        onChange={(color) => handleStyleUpdate({ bodyTextColor: color })}
                      >
                        <button
                          type="button"
                          className="flex h-7 w-7 cursor-pointer items-center justify-center"
                          title="Body text color"
                        >
                          {currentBodyTextColor || currentTextColor ? (
                            <ColorSwatch color={currentBodyTextColor ?? currentTextColor ?? "#475569"} className="h-5 w-5" />
                          ) : (
                            <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                          )}
                        </button>
                      </ColorPicker>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Border section - show for all nodes except text */}
            {!isTextNode && !allTextNodes && (
              <AccordionItem value="border" className="border-b-0 border-t border-slate-200">
                <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-600 hover:no-underline hover:bg-slate-50">
                  Border
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-xs text-slate-500">Color</label>
                      <ColorPicker
                        value={currentBorderColor ?? (isShapeNode || allShapeNodes ? "#3B82F6" : "#e2e8f0")}
                        onChange={(color) => handleStyleUpdate({ borderColor: color })}
                      >
                        <button
                          type="button"
                          className="flex h-7 w-7 cursor-pointer items-center justify-center"
                          title="Border color"
                        >
                          {currentBorderColor ? (
                            <ColorSwatch color={currentBorderColor} className="h-5 w-5" />
                          ) : (
                            <div className="h-5 w-5 rounded border border-slate-300 bg-gradient-to-br from-slate-200 via-white to-slate-200" title="Mixed" />
                          )}
                        </button>
                      </ColorPicker>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <label className="text-xs text-slate-500">Style</label>
                      <ToggleGroup
                        type="single"
                        className="h-7 rounded-md border border-slate-200 bg-white"
                        value={currentBorderStyle ?? "solid"}
                        onValueChange={(value) => {
                          if (!value) {
                            return;
                          }
                          handleStyleUpdate({ borderStyle: value as NodeBorderStyle });
                        }}
                        aria-label="Border style"
                      >
                        {borderStyles.map((style) => (
                          <Tooltip key={style.value}>
                            <TooltipTrigger asChild>
                              <ToggleGroupItem
                                value={style.value}
                                className="h-full w-8 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                                variant="ghost"
                              >
                                {style.icon}
                              </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>{style.label}</TooltipContent>
                          </Tooltip>
                        ))}
                      </ToggleGroup>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <label className="text-xs text-slate-500">Width</label>
                      <ToggleGroup
                        type="single"
                        className="h-7 rounded-md border border-slate-200 bg-white"
                        value={String(currentBorderWidth ?? (isShapeNode || allShapeNodes ? 2 : 1))}
                        onValueChange={(value) => {
                          if (!value) {
                            return;
                          }
                          handleStyleUpdate({ borderWidth: Number(value) });
                        }}
                        aria-label="Border width"
                      >
                        {borderWidths.map((width) => (
                          <Tooltip key={width.value}>
                            <TooltipTrigger asChild>
                              <ToggleGroupItem
                                value={String(width.value)}
                                className="h-full w-8 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                                variant="ghost"
                              >
                                {width.value}
                              </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent>{width.label}</TooltipContent>
                          </Tooltip>
                        ))}
                      </ToggleGroup>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>
    </TooltipProvider>
  );
}
