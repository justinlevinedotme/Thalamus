/**
 * @file ComposedNode.tsx
 * @description Node component for user-composed custom nodes with configurable layouts, headers, footers, rows, and dynamic handles
 */

import { memo, useRef, useLayoutEffect, useState, useEffect } from "react";
import { Handle, Position, useUpdateNodeInternals, type Node, type NodeProps } from "@xyflow/react";
import { BaseNode } from "../../../components/ui/base-node";
import { BlockRenderer } from "../../composer/components/blocks";
import { NodeIconDisplay } from "../../../components/ui/icon-picker";
import type { ComposedNodeLayout, ComposedRow, EdgePadding } from "../../composer/types";
import { BORDER_RADIUS, SHADOWS, ROW_PADDING } from "../../composer/constants";
import { cn } from "../../../lib/utils";

// Convert edge padding to pixel offset (same as edgePaddingToOffset in utils.ts)
const EDGE_PADDING_OFFSET: Record<EdgePadding, number> = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
};

// Import the graph store's NodeStyle type for node-level style
import type { NodeStyle } from "../../../store/graphStore";

// Node data type for composed nodes
export interface ComposedNodeData extends Record<string, unknown> {
  label: string;
  layout: ComposedNodeLayout;
  style?: NodeStyle; // Node-level style from graph store (set by Map Style)
  runtimeValues?: {
    title?: string;
    editableBlocks?: Record<string, string>;
  };
}

type ComposedNodeType = Node<ComposedNodeData, "composed">;

// Render a single row content (no handles or labels - they're rendered separately)
function RowContent({ row }: { row: ComposedRow }) {
  const padding = ROW_PADDING[row.padding || "sm"];

  // Get background color from row or from header block if it's a header
  const backgroundColor =
    row.backgroundColor ||
    (row.content?.type === "header"
      ? (row.content as { backgroundColor?: string }).backgroundColor
      : undefined);

  return (
    <div className="flex items-center min-h-[24px]" style={{ padding, backgroundColor }}>
      <div className="flex-1 min-w-0">{row.content && <BlockRenderer block={row.content} />}</div>
    </div>
  );
}

function ComposedNodeComponent({ id, data, selected }: NodeProps<ComposedNodeType>) {
  const { layout, runtimeValues, style: nodeStyle } = data;
  const nodeRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [rowPositions, setRowPositions] = useState<Map<string, number>>(new Map());
  const updateNodeInternals = useUpdateNodeInternals();

  const hasAnyHandles = layout?.rows.some((row) => row.leftHandle || row.rightHandle) ?? false;
  const handleCount = layout?.rows.filter((row) => row.leftHandle || row.rightHandle).length ?? 0;

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, handleCount, updateNodeInternals]);

  // Calculate row positions after render using offsetTop for more reliable positioning
  useLayoutEffect(() => {
    const calculatePositions = () => {
      if (!nodeRef.current) return;

      const positions = new Map<string, number>();

      rowRefs.current.forEach((el, rowId) => {
        if (el) {
          // Use offsetTop + half height for center position relative to parent
          const rowCenter = el.offsetTop + el.offsetHeight / 2;
          positions.set(rowId, rowCenter);
        }
      });

      setRowPositions(positions);
    };

    // Calculate immediately
    calculatePositions();

    // Also recalculate after a brief delay to handle any layout shifts
    const timer = setTimeout(calculatePositions, 50);
    return () => clearTimeout(timer);
  }, [layout, layout?.rows, layout?.header]);

  if (!layout) {
    return (
      <BaseNode selected={selected} className="p-3 min-w-[120px]">
        {" "}
        {/* 12 × 10 for grid alignment */}
        <div className="text-sm text-muted-foreground">No layout defined</div>
      </BaseNode>
    );
  }

  const style = layout.style;
  const borderRadius = BORDER_RADIUS[style.borderRadius || "md"];
  const shadow = SHADOWS[style.shadow || "sm"];

  // Use node-level edgePadding (from Map Style) if set, otherwise use layout's edgePadding
  const effectiveEdgePadding = (nodeStyle?.edgePadding ||
    style.edgePadding ||
    "none") as EdgePadding;
  const edgePaddingOffset = EDGE_PADDING_OFFSET[effectiveEdgePadding];

  return (
    <div
      ref={nodeRef}
      className={cn(
        "relative",
        selected && "ring-2 ring-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.35)]"
      )}
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
        borderStyle: style.borderStyle,
        borderRadius,
        boxShadow: shadow,
        minWidth: style.minWidth || 144, // 12 × 12 for grid alignment
        maxWidth: style.maxWidth || 396, // 12 × 33 for grid alignment
      }}
    >
      {/* Header */}
      {layout.header && (
        <div
          className="px-3 py-2 border-b overflow-hidden"
          style={{
            backgroundColor: layout.header.backgroundColor || "#f8fafc",
            borderColor: style.borderColor,
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
          }}
        >
          <div
            className="font-medium text-sm flex items-center gap-1.5"
            style={{ color: layout.header.textColor || "#1e293b" }}
          >
            {layout.header.icon && (
              <NodeIconDisplay icon={layout.header.icon} className="h-4 w-4 flex-shrink-0" />
            )}
            {runtimeValues?.title || layout.header.title}
          </div>
          {layout.header.subtitle && (
            <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {layout.header.subtitle}
            </div>
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

      {/* Hidden handles to prevent React Flow default connection UI when no handles defined */}
      {!hasAnyHandles && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="__hidden-target"
            className="!opacity-0 !pointer-events-none !w-0 !h-0"
            isConnectable={false}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="__hidden-source"
            className="!opacity-0 !pointer-events-none !w-0 !h-0"
            isConnectable={false}
          />
        </>
      )}

      {/* Handles and labels - positioned based on row centers */}
      {layout.rows.flatMap((row) => {
        const topPos = rowPositions.get(row.id);
        const elements = [];

        if (row.leftHandle && topPos !== undefined) {
          // Default to outlined for target/input handles
          const isFilled = row.leftHandle.style === "filled";
          const handleColor = row.leftHandle.color || "#64748b";
          elements.push(
            <Handle
              key={`left-${row.leftHandle.id}`}
              type="target"
              position={Position.Left}
              id={row.leftHandle.id}
              className="!w-3 !h-3"
              style={{
                top: topPos,
                left: -edgePaddingOffset,
                background: isFilled ? handleColor : style.backgroundColor || "white",
                borderColor: handleColor,
                borderWidth: 2,
              }}
            />
          );
          // Left handle label
          if (row.leftHandle.label && row.leftHandle.labelPosition !== "hidden") {
            const isOutside = row.leftHandle.labelPosition !== "inside";
            elements.push(
              <span
                key={`left-label-${row.leftHandle.id}`}
                className="absolute text-xs pointer-events-none whitespace-nowrap"
                style={{
                  top: topPos,
                  color: row.leftHandle.labelColor || "#64748b",
                  ...(isOutside
                    ? { right: "100%", marginRight: 12 + edgePaddingOffset }
                    : { left: 12 }),
                  transform: "translateY(-50%)",
                }}
              >
                {row.leftHandle.label}
              </span>
            );
          }
        }
        if (row.rightHandle && topPos !== undefined) {
          // Default to filled for source/output handles
          const isFilled = row.rightHandle.style !== "outlined";
          const handleColor = row.rightHandle.color || "#64748b";
          elements.push(
            <Handle
              key={`right-${row.rightHandle.id}`}
              type="source"
              position={Position.Right}
              id={row.rightHandle.id}
              className="!w-3 !h-3"
              style={{
                top: topPos,
                right: -edgePaddingOffset,
                background: isFilled ? handleColor : style.backgroundColor || "white",
                borderColor: handleColor,
                borderWidth: 2,
              }}
            />
          );
          // Right handle label
          if (row.rightHandle.label && row.rightHandle.labelPosition !== "hidden") {
            const isOutside = row.rightHandle.labelPosition !== "inside";
            elements.push(
              <span
                key={`right-label-${row.rightHandle.id}`}
                className="absolute text-xs pointer-events-none whitespace-nowrap"
                style={{
                  top: topPos,
                  color: row.rightHandle.labelColor || "#64748b",
                  ...(isOutside
                    ? { left: "100%", marginLeft: 12 + edgePaddingOffset }
                    : { right: 12 }),
                  transform: "translateY(-50%)",
                }}
              >
                {row.rightHandle.label}
              </span>
            );
          }
        }

        return elements;
      })}
    </div>
  );
}

export default memo(ComposedNodeComponent);
