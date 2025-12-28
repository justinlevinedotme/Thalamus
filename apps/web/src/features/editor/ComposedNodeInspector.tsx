import { Puzzle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useComposerStore } from "../composer/composerStore";
import { useGraphStore } from "../../store/graphStore";
import type { ComposedNodeLayout } from "../composer/types";

export default function ComposedNodeInspector() {
  const { selectedNodeId, nodes } = useGraphStore();
  const openComposer = useComposerStore((s) => s.openComposer);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const layout = selectedNode?.data?.layout as ComposedNodeLayout | undefined;

  const handleEditInComposer = () => {
    openComposer("edit", selectedNodeId, layout);
  };

  return (
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

        <Button variant="outline" size="sm" className="w-full" onClick={handleEditInComposer}>
          <Puzzle className="mr-2 h-4 w-4" />
          Edit in Node Composer
        </Button>
      </CardContent>
    </Card>
  );
}
