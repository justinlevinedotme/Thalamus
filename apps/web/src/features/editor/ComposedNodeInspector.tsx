import { Puzzle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useComposerStore } from "../composer/composerStore";
import { type EdgePadding, useGraphStore } from "../../store/graphStore";
import type { ComposedNodeLayout } from "../composer/types";

const edgePaddings: Array<{ value: EdgePadding; label: string }> = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export default function ComposedNodeInspector() {
  const { selectedNodeId, nodes, updateNodeStyle } = useGraphStore();
  const openComposer = useComposerStore((s) => s.openComposer);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const layout = selectedNode?.data?.layout as ComposedNodeLayout | undefined;
  const currentEdgePadding = selectedNode?.data?.style?.edgePadding;

  // Check if node has any handles
  const hasHandles = layout?.rows.some((row) => row.leftHandle || row.rightHandle) ?? false;

  const handleEditInComposer = () => {
    openComposer("edit", selectedNodeId, layout);
  };

  const handleEdgePaddingChange = (value: string) => {
    if (!value || !selectedNodeId) return;
    updateNodeStyle(selectedNodeId, { edgePadding: value as EdgePadding });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="border-border bg-background">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Puzzle className="h-4 w-4" />
            Composed Node
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {layout?.name || "Untitled Composition"}
          </div>

          {layout && (
            <div className="text-xs text-muted-foreground">
              {layout.rows.length} row{layout.rows.length !== 1 ? "s" : ""}
              {layout.header && " • Header"}
              {layout.footer?.content && " • Footer"}
            </div>
          )}

          {/* Edge padding control - only show if node has handles */}
          {hasHandles && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs text-muted-foreground">Edge Padding</label>
                <ToggleGroup
                  type="single"
                  className="h-7 rounded-md border border-border bg-background"
                  value={currentEdgePadding ?? ""}
                  onValueChange={handleEdgePaddingChange}
                  aria-label="Edge padding"
                >
                  {edgePaddings.map((padding) => (
                    <Tooltip key={padding.value}>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={padding.value}
                          className="h-full w-10 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
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
              {!currentEdgePadding && (
                <p className="text-[10px] text-muted-foreground">
                  Using global edge padding from Map Style
                </p>
              )}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full" onClick={handleEditInComposer}>
            <Puzzle className="mr-2 h-4 w-4" />
            Edit in Node Composer
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
