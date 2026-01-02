import { useMemo } from "react";
import type { EdgeMarkerSize, EdgeMarkerType, RelationshipData } from "../../store/graphStore";
import { getMarkerId } from "../../store/graphStore";

type CustomMarkerDefsProps = {
  edges: Array<{ data?: RelationshipData }>;
};

export function CustomMarkerDefs({ edges }: CustomMarkerDefsProps) {
  const markerConfigs = useMemo(() => {
    const configMap = new Map<
      string,
      { type: EdgeMarkerType; color: string; size: EdgeMarkerSize }
    >();

    for (const edge of edges) {
      const style = edge.data?.style;
      const color = style?.color ?? "#94A3B8";
      const size = style?.markerSize ?? "md";

      for (const markerType of [style?.markerStart, style?.markerEnd]) {
        if (markerType === "circle" || markerType === "diamond") {
          const key = `${markerType}-${color}-${size}`;
          if (!configMap.has(key)) {
            configMap.set(key, { type: markerType, color, size });
          }
        }
      }
    }

    return Array.from(configMap.values());
  }, [edges]);

  const sizeToValue = (size: EdgeMarkerSize): number => {
    switch (size) {
      case "xs":
        return 8;
      case "sm":
        return 15;
      case "lg":
        return 35;
      default:
        return 25;
    }
  };

  if (markerConfigs.length === 0) return null;

  return (
    <svg style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0 }}>
      <defs>
        {markerConfigs.map(({ type, color, size }) => {
          const id = getMarkerId(type, color, size);
          const markerSize = sizeToValue(size);

          if (type === "circle") {
            return (
              <marker
                key={id}
                id={id}
                markerWidth={markerSize}
                markerHeight={markerSize}
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={markerSize / 2}
                refY={markerSize / 2}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <circle
                  cx={markerSize / 2}
                  cy={markerSize / 2}
                  r={markerSize / 2 - 1}
                  fill={color}
                />
              </marker>
            );
          }

          if (type === "diamond") {
            const half = markerSize / 2;
            return (
              <marker
                key={id}
                id={id}
                markerWidth={markerSize}
                markerHeight={markerSize}
                viewBox={`0 0 ${markerSize} ${markerSize}`}
                refX={half}
                refY={half}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${half} 0 L ${markerSize} ${half} L ${half} ${markerSize} L 0 ${half} Z`}
                  fill={color}
                />
              </marker>
            );
          }

          return null;
        })}
      </defs>
    </svg>
  );
}
