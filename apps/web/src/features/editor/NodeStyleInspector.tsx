import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  type NodeShape,
  type NodeSize,
  useGraphStore,
} from "../../store/graphStore";

const nodeShapes: NodeShape[] = ["rounded", "pill", "circle", "square"];
const nodeSizes: NodeSize[] = ["sm", "md", "lg"];

export default function NodeStyleInspector() {
  const {
    nodes,
    selectedNodeId,
    updateNodeStyle,
  } = useGraphStore();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Select a node to edit its type and style.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Color
        </label>
        <Input
          type="color"
          value={selectedNode.data.style?.color ?? "#E2E8F0"}
          onChange={(event) =>
            updateNodeStyle(selectedNode.id, { color: event.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Shape
        </label>
        <Select
          value={selectedNode.data.style?.shape ?? "rounded"}
          onValueChange={(value) =>
            updateNodeStyle(selectedNode.id, { shape: value as NodeShape })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select shape" />
          </SelectTrigger>
          <SelectContent>
            {nodeShapes.map((shape) => (
              <SelectItem key={shape} value={shape}>
                {shape}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Size
        </label>
        <Select
          value={selectedNode.data.style?.size ?? "md"}
          onValueChange={(value) =>
            updateNodeStyle(selectedNode.id, { size: value as NodeSize })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {nodeSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
