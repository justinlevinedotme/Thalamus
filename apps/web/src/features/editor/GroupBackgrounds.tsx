import { useMemo } from "react";
import { Panel, useViewport } from "@xyflow/react";
import type { AppNode, NodeGroup } from "../../store/graphStore";

type GroupBackgroundsProps = {
  groups: NodeGroup[];
  nodes: AppNode[];
};

export function GroupBackgrounds({ groups, nodes }: GroupBackgroundsProps) {
  const { x, y, zoom } = useViewport();

  const activeGroupIds = useMemo(() => {
    const ids = new Set<string>();
    for (const node of nodes) {
      if (node.selected && node.data?.groupId) {
        ids.add(node.data.groupId);
      }
    }
    return ids;
  }, [nodes]);

  const groupBounds = useMemo(() => {
    const bounds: Record<string, { minX: number; minY: number; maxX: number; maxY: number }> = {};

    for (const node of nodes) {
      const groupId = node.data?.groupId;
      if (!groupId || !activeGroupIds.has(groupId)) continue;

      const nodeWidth = node.width ?? 144;
      const nodeHeight = node.height ?? 48;
      const x1 = node.position.x;
      const y1 = node.position.y;
      const x2 = x1 + nodeWidth;
      const y2 = y1 + nodeHeight;

      if (!bounds[groupId]) {
        bounds[groupId] = { minX: x1, minY: y1, maxX: x2, maxY: y2 };
      } else {
        bounds[groupId].minX = Math.min(bounds[groupId].minX, x1);
        bounds[groupId].minY = Math.min(bounds[groupId].minY, y1);
        bounds[groupId].maxX = Math.max(bounds[groupId].maxX, x2);
        bounds[groupId].maxY = Math.max(bounds[groupId].maxY, y2);
      }
    }

    return bounds;
  }, [nodes, activeGroupIds]);

  const padding = 16;
  const strokeColor = "#D946EF";
  const backgroundColor = "rgba(217, 70, 239, 0.05)";
  const labelColor = "#A21CAF";

  if (activeGroupIds.size === 0) return null;

  const visibleGroups = groups.filter((g) => activeGroupIds.has(g.id));

  return (
    <Panel position="top-left" className="!pointer-events-none !m-0 !p-0">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        }}
      >
        {visibleGroups.map((group) => {
          const bound = groupBounds[group.id];
          if (!bound) return null;

          return (
            <div
              key={group.id}
              className="pointer-events-none absolute rounded-xl border-2 border-dashed"
              style={{
                left: bound.minX - padding,
                top: bound.minY - padding,
                width: bound.maxX - bound.minX + padding * 2,
                height: bound.maxY - bound.minY + padding * 2,
                backgroundColor,
                borderColor: strokeColor,
              }}
            >
              <span
                className="absolute -top-5 left-2 whitespace-nowrap text-xs font-medium"
                style={{ color: labelColor }}
              >
                {group.label}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
