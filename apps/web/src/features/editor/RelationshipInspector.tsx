import { Trash2 } from "lucide-react";

import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  type EdgeCurvature,
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
const curvatures: EdgeCurvature[] = ["smoothstep", "bezier", "straight"];

export default function RelationshipInspector() {
  const {
    edges,
    selectedEdgeId,
    updateEdgeLabel,
    updateEdgeData,
    updateEdgeStyle,
  } = useGraphStore();

  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);
  const hasLabel =
    (selectedEdge?.label?.toString().trim() ?? "").length > 0;

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
        <div className="relative">
          <Input
            className="pr-8"
            value={selectedEdge.label?.toString() ?? ""}
            onChange={(event) =>
              updateEdgeLabel(selectedEdge.id, event.target.value)
            }
            placeholder="relationship"
          />
          {hasLabel ? (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition hover:text-slate-600"
              type="button"
              onClick={() => updateEdgeLabel(selectedEdge.id, "")}
              aria-label="Clear label"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
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

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Color
        </label>
        <Input
          type="color"
          value={selectedEdge.data?.style?.color ?? "#94A3B8"}
          onChange={(event) =>
            updateEdgeStyle(selectedEdge.id, { color: event.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Thickness
        </label>
        <Input
          type="number"
          min={1}
          max={8}
          value={selectedEdge.data?.style?.thickness ?? 2}
          onChange={(event) =>
            updateEdgeStyle(selectedEdge.id, {
              thickness: Number(event.target.value),
            })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Curvature
        </label>
        <Select
          value={selectedEdge.data?.style?.curvature ?? "smoothstep"}
          onValueChange={(value) =>
            updateEdgeStyle(selectedEdge.id, {
              curvature: value as EdgeCurvature,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select curvature" />
          </SelectTrigger>
          <SelectContent>
            {curvatures.map((curvature) => (
              <SelectItem key={curvature} value={curvature}>
                {curvature}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
