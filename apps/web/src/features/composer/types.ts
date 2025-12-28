import type { NodeIcon } from "../../store/graphStore";

// ============================================================================
// Handle Types
// ============================================================================

export type HandlePosition = "left" | "right";
export type HandleType = "source" | "target";

export type LabelPosition = "inside" | "outside" | "hidden";
export type HandleStyle = "filled" | "outlined";

export interface ComposedHandle {
  id: string;
  type: HandleType;
  position: HandlePosition;
  label?: string;
  labelPosition?: LabelPosition;
  color?: string;
  style?: HandleStyle;
}

// ============================================================================
// Content Block Types
// ============================================================================

export type ContentBlockType =
  | "header" // Header with title, subtitle, icon
  | "text" // Markdown/plain text content
  | "richtext" // Full rich text editor content
  | "keyvalue" // Key-value pairs display
  | "code" // Code block
  | "separator" // Visual divider
  | "icon" // Icon display
  | "badge" // Status badge
  | "status" // Status indicator with color
  | "spacer"; // Empty space

export type FontSize = "xs" | "sm" | "md" | "lg";
export type FontWeight = "normal" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right";
export type SpacerSize = "xs" | "sm" | "md" | "lg";
export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
export type StatusType = "active" | "inactive" | "pending" | "error" | "custom";
export type SeparatorStyle = "solid" | "dashed" | "dotted";

// Base interface for all content blocks
export interface ContentBlockBase {
  id: string;
  type: ContentBlockType;
}

// Header block - title with optional subtitle and icon
export interface HeaderBlock extends ContentBlockBase {
  type: "header";
  title: string;
  subtitle?: string;
  icon?: NodeIcon;
  backgroundColor?: string;
  textColor?: string;
}

// Text block - simple text/markdown content
export interface TextBlock extends ContentBlockBase {
  type: "text";
  content: string;
  fontSize?: FontSize;
  fontWeight?: FontWeight;
  color?: string;
  align?: TextAlign;
  icon?: NodeIcon;
  iconPosition?: "left" | "right";
}

// Rich text block - TipTap HTML content
export interface RichTextBlock extends ContentBlockBase {
  type: "richtext";
  content: string; // HTML content from TipTap
  editable?: boolean; // Whether user can edit at runtime
  placeholder?: string;
}

// Key-value pairs block
export interface KeyValueEntry {
  key: string;
  value: string;
  keyColor?: string;
  valueColor?: string;
}

export interface KeyValueBlock extends ContentBlockBase {
  type: "keyvalue";
  entries: KeyValueEntry[];
  separator?: string; // Default: ':'
  layout?: "inline" | "stacked";
}

// Code block
export type CodeTheme = "light" | "dark";

export interface CodeBlock extends ContentBlockBase {
  type: "code";
  content: string;
  language?: string;
  showLineNumbers?: boolean;
  theme?: CodeTheme;
}

// Separator/divider block
export interface SeparatorBlock extends ContentBlockBase {
  type: "separator";
  style?: SeparatorStyle;
  color?: string;
  thickness?: number;
  margin?: "none" | "sm" | "md" | "lg";
}

// Icon block
export interface IconBlock extends ContentBlockBase {
  type: "icon";
  icon: NodeIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: string;
}

// Badge block
export interface BadgeBlock extends ContentBlockBase {
  type: "badge";
  text: string;
  variant?: BadgeVariant;
  size?: "xs" | "sm" | "md";
}

// Status indicator block
export interface StatusBlock extends ContentBlockBase {
  type: "status";
  label?: string;
  status: StatusType;
  customColor?: string;
  showDot?: boolean;
}

// Spacer block
export interface SpacerBlock extends ContentBlockBase {
  type: "spacer";
  height: SpacerSize;
}

// Union type of all content blocks
export type ContentBlock =
  | HeaderBlock
  | TextBlock
  | RichTextBlock
  | KeyValueBlock
  | CodeBlock
  | SeparatorBlock
  | IconBlock
  | BadgeBlock
  | StatusBlock
  | SpacerBlock;

// ============================================================================
// Row Layout
// ============================================================================

export type RowPadding = "none" | "xs" | "sm" | "md";

export interface ComposedRow {
  id: string;
  leftHandle?: ComposedHandle; // Optional left-side handle
  rightHandle?: ComposedHandle; // Optional right-side handle
  content?: ContentBlock; // Optional content block
  padding?: RowPadding;
  backgroundColor?: string;
}

// ============================================================================
// Node Header & Footer
// ============================================================================

export interface ComposedHeader {
  icon?: NodeIcon;
  title: string;
  titleEditable?: boolean; // Whether title can be edited at runtime
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ComposedFooter {
  content?: ContentBlock;
  backgroundColor?: string;
}

// ============================================================================
// Node Style
// ============================================================================

export type BorderRadius = "none" | "sm" | "md" | "lg" | "full";
export type ShadowSize = "none" | "sm" | "md" | "lg";
export type BorderStyle = "solid" | "dashed" | "dotted";
export type EdgePadding = "none" | "sm" | "md" | "lg";

export interface ComposedNodeStyle {
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: BorderStyle;
  borderRadius?: BorderRadius;
  minWidth?: number;
  maxWidth?: number;
  shadow?: ShadowSize;
  edgePadding?: EdgePadding;
}

// ============================================================================
// Complete Node Layout
// ============================================================================

export interface ComposedNodeLayout {
  id: string;
  name: string;
  description?: string;

  // Header section
  header?: ComposedHeader;

  // Body rows
  rows: ComposedRow[];

  // Footer section
  footer?: ComposedFooter;

  // Global node styling
  style: ComposedNodeStyle;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
  isTemplate?: boolean;
}

// ============================================================================
// Template System
// ============================================================================

export interface NodeTemplate extends ComposedNodeLayout {
  category?: string;
  tags?: string[];
  isBuiltIn?: boolean;
  userId?: string;
}

// ============================================================================
// Composer State Types
// ============================================================================

export type ComposerMode = "create" | "edit" | "template";

export interface DragItem {
  type: "palette-block" | "palette-handle" | "row";
  blockType?: ContentBlockType;
  handleType?: HandleType;
  handlePosition?: HandlePosition;
  rowId?: string;
  data?: unknown;
}

// ============================================================================
// Palette Definitions
// ============================================================================

export interface PaletteItemDefinition {
  id: string;
  type: "handle" | "block";
  blockType?: ContentBlockType;
  handleType?: HandleType;
  handlePosition?: HandlePosition;
  label: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface PaletteCategory {
  id: string;
  label: string;
  items: PaletteItemDefinition[];
}

// ============================================================================
// Default Factory Functions
// ============================================================================

export function createDefaultRow(id: string): ComposedRow {
  return {
    id,
    padding: "sm",
  };
}

export function createDefaultLayout(id: string, name: string): ComposedNodeLayout {
  return {
    id,
    name,
    rows: [],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  };
}

export function createDefaultHandle(
  id: string,
  type: HandleType,
  position: HandlePosition
): ComposedHandle {
  return {
    id,
    type,
    position,
  };
}

export function createDefaultTextBlock(id: string): TextBlock {
  return {
    id,
    type: "text",
    content: "Text content",
    fontSize: "sm",
    fontWeight: "normal",
    align: "left",
  };
}

export function createDefaultSeparatorBlock(id: string): SeparatorBlock {
  return {
    id,
    type: "separator",
    style: "solid",
    thickness: 1,
    margin: "sm",
  };
}

export function createDefaultBadgeBlock(id: string): BadgeBlock {
  return {
    id,
    type: "badge",
    text: "Badge",
    variant: "default",
    size: "sm",
  };
}

export function createDefaultStatusBlock(id: string): StatusBlock {
  return {
    id,
    type: "status",
    status: "active",
    showDot: true,
  };
}

export function createDefaultSpacerBlock(id: string): SpacerBlock {
  return {
    id,
    type: "spacer",
    height: "sm",
  };
}

export function createDefaultKeyValueBlock(id: string): KeyValueBlock {
  return {
    id,
    type: "keyvalue",
    entries: [{ key: "Key", value: "Value" }],
    separator: ":",
    layout: "inline",
  };
}

export function createDefaultCodeBlock(id: string): CodeBlock {
  return {
    id,
    type: "code",
    content: "// Code here",
    showLineNumbers: false,
  };
}

export function createDefaultIconBlock(id: string): IconBlock {
  return {
    id,
    type: "icon",
    icon: { type: "lucide", value: "circle" },
    size: "md",
  };
}

export function createDefaultRichTextBlock(id: string): RichTextBlock {
  return {
    id,
    type: "richtext",
    content: "<p>Rich text content</p>",
    editable: true,
    placeholder: "Enter text...",
  };
}

export function createDefaultHeaderBlock(id: string): HeaderBlock {
  return {
    id,
    type: "header",
    title: "Header",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
  };
}

// Factory function to create any block by type
export function createBlockByType(id: string, type: ContentBlockType): ContentBlock {
  switch (type) {
    case "header":
      return createDefaultHeaderBlock(id);
    case "text":
      return createDefaultTextBlock(id);
    case "richtext":
      return createDefaultRichTextBlock(id);
    case "keyvalue":
      return createDefaultKeyValueBlock(id);
    case "code":
      return createDefaultCodeBlock(id);
    case "separator":
      return createDefaultSeparatorBlock(id);
    case "icon":
      return createDefaultIconBlock(id);
    case "badge":
      return createDefaultBadgeBlock(id);
    case "status":
      return createDefaultStatusBlock(id);
    case "spacer":
      return createDefaultSpacerBlock(id);
  }
}
