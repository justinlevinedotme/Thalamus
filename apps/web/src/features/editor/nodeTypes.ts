import type { NodeTypes } from "@xyflow/react";

import EditableNode from "./nodes/EditableNode";
import NodeKeyNode from "./nodes/NodeKeyNode";
import PathKeyNode from "./nodes/PathKeyNode";
import ShapeNode from "./nodes/ShapeNode";
import TextNode from "./nodes/TextNode";

// Define nodeTypes with explicit typing to prevent ReactFlow inference issues
export const nodeTypes: NodeTypes = {
  editable: EditableNode,
  text: TextNode,
  shape: ShapeNode,
  pathKey: PathKeyNode,
  nodeKey: NodeKeyNode,
};
