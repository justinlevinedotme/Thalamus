import EditableNode from "./nodes/EditableNode";
import NodeKeyNode from "./nodes/NodeKeyNode";
import PathKeyNode from "./nodes/PathKeyNode";
import ShapeNode from "./nodes/ShapeNode";
import TextNode from "./nodes/TextNode";

export const nodeTypes = {
  editable: EditableNode,
  text: TextNode,
  shape: ShapeNode,
  pathKey: PathKeyNode,
  nodeKey: NodeKeyNode,
};
