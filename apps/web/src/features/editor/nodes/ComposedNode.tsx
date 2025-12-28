import { memo, useRef, useLayoutEffect, useState } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { BaseNode } from "../../../components/ui/base-node";
import { BlockRenderer } from "../../composer/components/blocks";
import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import type { ComposedNodeLayout, ComposedRow } from "../../composer/types";
import { BORDER_RADIUS, SHADOWS, ROW_PADDING } from "../../composer/constants";
import { cn } from "../../../lib/utils";

// Node data type for composed nodes
export interface ComposedNodeData extends Record<string, unknown> {
  label: string;
  layout: ComposedNodeLayout;
  runtimeValues?: {
    title?: string;
    editableBlocks?: Record<string, string>;
  };
}

type ComposedNodeType = Node<ComposedNodeData, "composed">;

// Render a single row content (no handles - they're rendered separately)
function RowContent({ row }: { row: ComposedRow }) {
  const padding = ROW_PADDING[row.padding || "sm"];

  return (
    <div className="flex items-center gap-2 min-h-[24px]" style={{ padding }}>
      {/* Left handle label */}
      {row.leftHandle?.label && (
        <span className="text-xs text-muted-foreground">{row.leftHandle.label}</span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">{row.content && <BlockRenderer block={row.content} />}</div>

      {/* Right handle label */}
      {row.rightHandle?.label && (
        <span className="text-xs text-muted-foreground">{row.rightHandle.label}</span>
      )}
    </div>
  );
}

function ComposedNodeComponent({ data, selected }: NodeProps<ComposedNodeType>) {
  const { layout, runtimeValues } = data;
  const nodeRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [rowPositions, setRowPositions] = useState<Map<string, number>>(new Map());

  // Calculate row positions after render
  useLayoutEffect(() => {
    if (!nodeRef.current) return;

    const nodeRect = nodeRef.current.getBoundingClientRect();
    const positions = new Map<string, number>();

    rowRefs.current.forEach((el, rowId) => {
      if (el) {
        const rowRect = el.getBoundingClientRect();
        // Calculate the center of the row relative to the node
        const rowCenter = rowRect.top + rowRect.height / 2 - nodeRect.top;
        positions.set(rowId, rowCenter);
      }
    });

    setRowPositions(positions);
  }, [layout]);

  if (!layout) {
    return (
      <BaseNode selected={selected} className="p-3 min-w-[120px]">
        <div className="text-sm text-muted-foreground">No layout defined</div>
      </BaseNode>
    );
  }

  const style = layout.style;
  const borderRadius = BORDER_RADIUS[style.borderRadius || "md"];
  const shadow = SHADOWS[style.shadow || "sm"];

  return (
    <div
      ref={nodeRef}
      className={cn("relative", selected && "ring-2 ring-primary ring-offset-1")}
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
        borderStyle: style.borderStyle,
        borderRadius,
        boxShadow: shadow,
        minWidth: style.minWidth || 150,
        maxWidth: style.maxWidth || 400,
      }}
    >
      {/* Header */}
      {layout.header && (
        <div
          className="px-3 py-2 border-b overflow-hidden"
          style={{
            backgroundColor: layout.header.backgroundColor,
            borderColor: style.borderColor,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
          }}
        >
          <div
            className="font-medium text-sm flex items-center gap-1.5"
            style={{ color: layout.header.textColor }}
          >
            {layout.header.icon && (
              <NodeIconDisplay icon={layout.header.icon} className="h-4 w-4 flex-shrink-0" />
            )}
            {runtimeValues?.title || layout.header.title}
          </div>
          {layout.header.subtitle && (
            <div className="text-xs text-muted-foreground mt-0.5">{layout.header.subtitle}</div>
          )}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-0">
        {layout.rows.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4 px-3">Empty node</div>
        ) : (
          layout.rows.map((row) => (
            <div
              key={row.id}
              ref={(el) => {
                if (el) rowRefs.current.set(row.id, el);
                else rowRefs.current.delete(row.id);
              }}
            >
              <RowContent row={row} />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {layout.footer && layout.footer.content && (
        <div
          className="px-3 py-2 border-t overflow-hidden"
          style={{
            backgroundColor: layout.footer.backgroundColor,
            borderColor: style.borderColor,
            borderBottomLeftRadius: borderRadius,
            borderBottomRightRadius: borderRadius,
          }}
        >
          <BlockRenderer block={layout.footer.content} />
        </div>
      )}

      {/* Handles - positioned based on row centers */}
      {layout.rows.flatMap((row) => {
        const topPos = rowPositions.get(row.id);
        const handles = [];

        if (row.leftHandle && topPos !== undefined) {
          handles.push(
            <Handle
              key={`left-${row.leftHandle.id}`}
              type="target"
              position={Position.Left}
              id={row.leftHandle.id}
              className="!w-3 !h-3"
              style={{
                top: topPos,
                background:
                  row.leftHandle.type === "target"
                    ? style.backgroundColor || "white"
                    : row.leftHandle.color || "#64748b",
                borderColor: row.leftHandle.color || "#64748b",
                borderWidth: 2,
              }}
            />
          );
        }
        if (row.rightHandle && topPos !== undefined) {
          handles.push(
            <Handle
              key={`right-${row.rightHandle.id}`}
              type="source"
              position={Position.Right}
              id={row.rightHandle.id}
              className="!w-3 !h-3"
              style={{
                top: topPos,
                background: row.rightHandle.color || "#64748b",
                borderColor: row.rightHandle.color || "#64748b",
                borderWidth: 2,
              }}
            />
          );
        }

        return handles;
      })}
    </div>
  );
}

export default memo(ComposedNodeComponent);
