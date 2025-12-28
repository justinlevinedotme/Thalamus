// Components
export { NodeComposerModal } from "./components/NodeComposerModal";
export { ComposerLayout } from "./components/ComposerLayout";
export { ComponentPalette } from "./components/ComponentPalette";
export { DropZone } from "./components/DropZone";
export { ConfigPanel } from "./components/ConfigPanel";
export { BlockRenderer } from "./components/blocks";

// Store
export { useComposerStore } from "./composerStore";

// Types
export type {
  ComposedNodeLayout,
  ComposedRow,
  ComposedHandle,
  ComposedHeader,
  ComposedFooter,
  ComposedNodeStyle,
  ContentBlock,
  ContentBlockType,
  TextBlock,
  RichTextBlock,
  KeyValueBlock,
  CodeBlock,
  SeparatorBlock,
  IconBlock,
  BadgeBlock,
  StatusBlock,
  SpacerBlock,
  NodeTemplate,
  DragItem,
  PaletteCategory,
  PaletteItemDefinition,
} from "./types";

// Factory functions
export {
  createDefaultLayout,
  createDefaultRow,
  createDefaultHandle,
  createBlockByType,
} from "./types";

// Constants
export { PALETTE_CATEGORIES, DEFAULT_NODE_STYLE, BADGE_VARIANTS, STATUS_COLORS } from "./constants";
