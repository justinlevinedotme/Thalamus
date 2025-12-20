import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  type RelationshipDirection,
  type RelationshipType,
  useGraphStore,
} from "../../store/graphStore";

const relationTypes: RelationshipType[] = [
  "related",
  "causes",
  "supports",
  "contradicts",
];

const directions: RelationshipDirection[] = ["forward", "backward", "none"];

export default function RelationshipInspector() {
  const {
    edges,
    selectedEdgeId,
    updateEdgeLabel,
    updateEdgeData,
  } = useGraphStore();

  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);

  if (!selectedEdge) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Select a relationship to edit its label, type, and direction.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Label
        </label>
        <Input
          value={selectedEdge.label?.toString() ?? ""}
          onChange={(event) => updateEdgeLabel(selectedEdge.id, event.target.value)}
          placeholder="relationship"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Type
        </label>
        <Select
          value={selectedEdge.data?.relationType ?? "related"}
          onValueChange={(value) =>
            updateEdgeData(selectedEdge.id, {
              relationType: value as RelationshipType,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {relationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Direction
        </label>
        <Select
          value={selectedEdge.data?.direction ?? "forward"}
          onValueChange={(value) =>
            updateEdgeData(selectedEdge.id, {
              direction: value as RelationshipDirection,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select direction" />
          </SelectTrigger>
          <SelectContent>
            {directions.map((direction) => (
              <SelectItem key={direction} value={direction}>
                {direction}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
