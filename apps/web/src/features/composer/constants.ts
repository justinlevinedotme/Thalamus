import type {
  PaletteCategory,
  ComposedNodeStyle,
  BadgeVariant,
  StatusType,
  NodeTemplate,
} from "./types";

// ============================================================================
// Palette Definitions
// ============================================================================

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    id: "handles",
    label: "Handles",
    items: [
      {
        id: "target-handle",
        type: "handle",
        handleType: "target",
        handlePosition: "left",
        label: "Input Handle",
        description: "Add an input connection point (left side)",
        icon: "circle-dot",
      },
      {
        id: "source-handle",
        type: "handle",
        handleType: "source",
        handlePosition: "right",
        label: "Output Handle",
        description: "Add an output connection point (right side)",
        icon: "circle",
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        id: "header-block",
        type: "block",
        blockType: "header",
        label: "Header",
        description: "Title with optional subtitle and icon",
        icon: "heading",
      },
      {
        id: "text-block",
        type: "block",
        blockType: "text",
        label: "Text",
        description: "Simple text with formatting options",
        icon: "type",
      },
      {
        id: "richtext-block",
        type: "block",
        blockType: "richtext",
        label: "Rich Text",
        description: "Rich text with inline editing",
        icon: "file-text",
      },
      {
        id: "keyvalue-block",
        type: "block",
        blockType: "keyvalue",
        label: "Key-Value",
        description: "Display key-value pairs",
        icon: "list",
      },
      {
        id: "code-block",
        type: "block",
        blockType: "code",
        label: "Code",
        description: "Code snippet display",
        icon: "code",
      },
    ],
  },
  {
    id: "visual",
    label: "Visual",
    items: [
      {
        id: "separator-block",
        type: "block",
        blockType: "separator",
        label: "Separator",
        description: "Horizontal divider line",
        icon: "minus",
      },
      {
        id: "icon-block",
        type: "block",
        blockType: "icon",
        label: "Icon",
        description: "Display an icon",
        icon: "smile",
      },
      {
        id: "badge-block",
        type: "block",
        blockType: "badge",
        label: "Badge",
        description: "Colored label badge",
        icon: "tag",
      },
      {
        id: "status-block",
        type: "block",
        blockType: "status",
        label: "Status",
        description: "Status indicator with dot",
        icon: "activity",
      },
      {
        id: "spacer-block",
        type: "block",
        blockType: "spacer",
        label: "Spacer",
        description: "Empty vertical space",
        icon: "move-vertical",
      },
    ],
  },
];

// ============================================================================
// Default Styles
// ============================================================================

export const DEFAULT_NODE_STYLE: ComposedNodeStyle = {
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: "md",
  shadow: "sm",
};

export const DEFAULT_HANDLE_COLORS = {
  target: "#64748b",
  source: "#64748b",
};

// ============================================================================
// Badge Variants
// ============================================================================

export const BADGE_VARIANTS: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: {
    bg: "#f1f5f9",
    text: "#475569",
    border: "#e2e8f0",
  },
  success: {
    bg: "#dcfce7",
    text: "#166534",
    border: "#bbf7d0",
  },
  warning: {
    bg: "#fef3c7",
    text: "#92400e",
    border: "#fde68a",
  },
  error: {
    bg: "#fee2e2",
    text: "#991b1b",
    border: "#fecaca",
  },
  info: {
    bg: "#dbeafe",
    text: "#1e40af",
    border: "#bfdbfe",
  },
};

// ============================================================================
// Status Colors
// ============================================================================

export const STATUS_COLORS: Record<StatusType, string> = {
  active: "#22c55e",
  inactive: "#94a3b8",
  pending: "#f59e0b",
  error: "#ef4444",
  custom: "#6366f1",
};

// ============================================================================
// Size Mappings
// ============================================================================

export const SPACER_HEIGHTS = {
  xs: "0.5rem",
  sm: "1rem",
  md: "1.5rem",
  lg: "2rem",
};

export const FONT_SIZES = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
};

export const ICON_SIZES = {
  xs: "0.75rem",
  sm: "1rem",
  md: "1.25rem",
  lg: "1.5rem",
  xl: "2rem",
};

export const BORDER_RADIUS = {
  none: "0",
  sm: "0.125rem",
  md: "0.375rem",
  lg: "0.5rem",
  full: "9999px",
};

export const SHADOWS = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};

export const ROW_PADDING = {
  none: "0",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
};

export const EDGE_PADDING = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
};

export const SEPARATOR_MARGIN = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
};

// ============================================================================
// Color Presets
// ============================================================================

export const BACKGROUND_COLOR_PRESETS = [
  "#ffffff", // White
  "#f8fafc", // Slate 50
  "#f1f5f9", // Slate 100
  "#fef3c7", // Amber 100
  "#dcfce7", // Green 100
  "#dbeafe", // Blue 100
  "#fce7f3", // Pink 100
  "#ede9fe", // Violet 100
];

export const BORDER_COLOR_PRESETS = [
  "#e2e8f0", // Slate 200
  "#cbd5e1", // Slate 300
  "#94a3b8", // Slate 400
  "#fbbf24", // Amber 400
  "#4ade80", // Green 400
  "#60a5fa", // Blue 400
  "#f472b6", // Pink 400
  "#a78bfa", // Violet 400
];

export const TEXT_COLOR_PRESETS = [
  "#0f172a", // Slate 900
  "#1e293b", // Slate 800
  "#334155", // Slate 700
  "#475569", // Slate 600
  "#64748b", // Slate 500
  "#ef4444", // Red 500
  "#22c55e", // Green 500
  "#3b82f6", // Blue 500
];

// ============================================================================
// Built-in Templates
// ============================================================================

export const BUILT_IN_TEMPLATES: NodeTemplate[] = [
  // ============================================================================
  // Basic Templates
  // ============================================================================
  {
    id: "template-simple",
    name: "Simple",
    description: "Basic node with just text",
    category: "Basic",
    tags: ["simple", "text"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        content: {
          id: "text-1",
          type: "text",
          content: "Simple text content",
          fontSize: "sm",
          fontWeight: "normal",
          color: "#334155",
        },
        padding: "md",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-titled",
    name: "Titled",
    description: "Header with text body",
    category: "Basic",
    tags: ["header", "text", "basic"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        content: {
          id: "header-1",
          type: "header",
          title: "Title",
          subtitle: "Subtitle",
          backgroundColor: "#f8fafc",
          textColor: "#1e293b",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        content: {
          id: "text-1",
          type: "text",
          content: "Description or body text goes here",
          fontSize: "sm",
          fontWeight: "normal",
          color: "#64748b",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-card",
    name: "Card",
    description: "Header with icon and content",
    category: "Basic",
    tags: ["card", "header", "icon"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        content: {
          id: "header-1",
          type: "header",
          title: "Card Title",
          icon: { type: "lucide", value: "file-text" },
          backgroundColor: "#f1f5f9",
          textColor: "#334155",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        content: {
          id: "text-1",
          type: "text",
          content: "Card content with some descriptive text",
          fontSize: "sm",
          fontWeight: "normal",
          color: "#64748b",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#cbd5e1",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: "lg",
      shadow: "md",
    },
  },
  {
    id: "template-note",
    name: "Note",
    description: "Simple note with badge",
    category: "Basic",
    tags: ["note", "badge"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        content: {
          id: "badge-1",
          type: "badge",
          text: "Note",
          variant: "info",
          size: "sm",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        content: {
          id: "text-1",
          type: "text",
          content: "This is a note or reminder",
          fontSize: "sm",
          fontWeight: "normal",
          color: "#334155",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#eff6ff",
      borderColor: "#93c5fd",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-process",
    name: "Process",
    description: "Node with input and output",
    category: "Basic",
    tags: ["process", "handles"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        leftHandle: { id: "in-1", type: "target", position: "left", color: "#64748b" },
        content: {
          id: "text-1",
          type: "text",
          content: "Process Step",
          fontSize: "sm",
          fontWeight: "medium",
          color: "#334155",
        },
        rightHandle: { id: "out-1", type: "source", position: "right", color: "#64748b" },
        padding: "md",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#cbd5e1",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-labeled-process",
    name: "Labeled Process",
    description: "Process with labeled handles",
    category: "Basic",
    tags: ["process", "labels", "handles"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        content: {
          id: "header-1",
          type: "header",
          title: "Process",
          backgroundColor: "#f8fafc",
          textColor: "#1e293b",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        leftHandle: { id: "in-1", type: "target", position: "left", label: "in", color: "#22c55e" },
        content: {
          id: "text-1",
          type: "text",
          content: "Transform data",
          fontSize: "xs",
          fontWeight: "normal",
          color: "#64748b",
        },
        rightHandle: {
          id: "out-1",
          type: "source",
          position: "right",
          label: "out",
          color: "#3b82f6",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  // ============================================================================
  // DDD Templates
  // ============================================================================
  {
    id: "template-event",
    name: "Event",
    description: "Domain event node",
    category: "DDD",
    tags: ["event", "domain"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        leftHandle: { id: "in-1", type: "target", position: "left", color: "#f97316" },
        content: {
          id: "header-1",
          type: "header",
          title: "OrderPlaced",
          subtitle: "Domain Event",
          icon: { type: "lucide", value: "zap" },
          backgroundColor: "#fff7ed",
          textColor: "#c2410c",
        },
        rightHandle: { id: "out-1", type: "source", position: "right", color: "#f97316" },
        padding: "sm",
      },
      {
        id: "row-2",
        content: {
          id: "kv-1",
          type: "keyvalue",
          entries: [
            { key: "orderId", value: "string" },
            { key: "timestamp", value: "Date" },
          ],
          separator: ":",
          layout: "inline",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#fdba74",
      borderWidth: 2,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-command",
    name: "Command",
    description: "Command node",
    category: "DDD",
    tags: ["command", "cqrs"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        leftHandle: { id: "in-1", type: "target", position: "left", color: "#3b82f6" },
        content: {
          id: "header-1",
          type: "header",
          title: "PlaceOrder",
          subtitle: "Command",
          icon: { type: "lucide", value: "terminal" },
          backgroundColor: "#eff6ff",
          textColor: "#1d4ed8",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        content: {
          id: "kv-1",
          type: "keyvalue",
          entries: [
            { key: "customerId", value: "string" },
            { key: "items", value: "OrderItem[]" },
          ],
          separator: ":",
          layout: "inline",
        },
        rightHandle: { id: "out-1", type: "source", position: "right", color: "#3b82f6" },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#93c5fd",
      borderWidth: 2,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-aggregate",
    name: "Aggregate",
    description: "Aggregate root node",
    category: "DDD",
    tags: ["aggregate", "domain"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        content: {
          id: "header-1",
          type: "header",
          title: "Order",
          subtitle: "Aggregate Root",
          icon: { type: "lucide", value: "box" },
          backgroundColor: "#f0fdf4",
          textColor: "#166534",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        leftHandle: {
          id: "in-1",
          type: "target",
          position: "left",
          label: "cmd",
          color: "#22c55e",
        },
        content: {
          id: "text-1",
          type: "text",
          content: "State & Business Logic",
          fontSize: "xs",
          fontWeight: "normal",
          color: "#64748b",
          align: "center",
        },
        rightHandle: {
          id: "out-1",
          type: "source",
          position: "right",
          label: "evt",
          color: "#22c55e",
        },
        padding: "sm",
      },
      {
        id: "row-3",
        content: {
          id: "sep-1",
          type: "separator",
          style: "dashed",
          color: "#bbf7d0",
          thickness: 1,
          margin: "sm",
        },
        padding: "none",
      },
      {
        id: "row-4",
        content: {
          id: "kv-1",
          type: "keyvalue",
          entries: [
            { key: "id", value: "OrderId" },
            { key: "status", value: "OrderStatus" },
          ],
          separator: ":",
          layout: "inline",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#86efac",
      borderWidth: 2,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-policy",
    name: "Policy",
    description: "Policy / Saga node",
    category: "DDD",
    tags: ["policy", "saga"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        leftHandle: {
          id: "in-1",
          type: "target",
          position: "left",
          label: "when",
          color: "#a855f7",
        },
        content: {
          id: "header-1",
          type: "header",
          title: "OrderPolicy",
          subtitle: "Policy",
          icon: { type: "lucide", value: "git-branch" },
          backgroundColor: "#faf5ff",
          textColor: "#7e22ce",
        },
        rightHandle: {
          id: "out-1",
          type: "source",
          position: "right",
          label: "then",
          color: "#a855f7",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        content: {
          id: "text-1",
          type: "text",
          content: "When OrderPlaced → Send Confirmation",
          fontSize: "xs",
          fontWeight: "normal",
          color: "#64748b",
          align: "left",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#d8b4fe",
      borderWidth: 2,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-service",
    name: "Service",
    description: "External service node",
    category: "System",
    tags: ["service", "external"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        content: {
          id: "header-1",
          type: "header",
          title: "Payment Gateway",
          subtitle: "External Service",
          icon: { type: "lucide", value: "cloud" },
          backgroundColor: "#f1f5f9",
          textColor: "#334155",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        leftHandle: {
          id: "in-1",
          type: "target",
          position: "left",
          label: "request",
          color: "#64748b",
        },
        content: {
          id: "badge-1",
          type: "badge",
          text: "REST API",
          variant: "info",
          size: "sm",
        },
        rightHandle: {
          id: "out-1",
          type: "source",
          position: "right",
          label: "response",
          color: "#64748b",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#cbd5e1",
      borderWidth: 1,
      borderStyle: "dashed",
      borderRadius: "md",
      shadow: "sm",
    },
  },
  {
    id: "template-read-model",
    name: "Read Model",
    description: "Query / Read model node",
    category: "DDD",
    tags: ["read-model", "cqrs", "query"],
    isBuiltIn: true,
    rows: [
      {
        id: "row-1",
        leftHandle: { id: "in-1", type: "target", position: "left", color: "#06b6d4" },
        content: {
          id: "header-1",
          type: "header",
          title: "OrderSummary",
          subtitle: "Read Model",
          icon: { type: "lucide", value: "database" },
          backgroundColor: "#ecfeff",
          textColor: "#0e7490",
        },
        padding: "sm",
      },
      {
        id: "row-2",
        content: {
          id: "kv-1",
          type: "keyvalue",
          entries: [
            { key: "orderId", value: "string" },
            { key: "total", value: "number" },
            { key: "itemCount", value: "number" },
          ],
          separator: ":",
          layout: "inline",
        },
        padding: "sm",
      },
    ],
    style: {
      backgroundColor: "#ffffff",
      borderColor: "#67e8f9",
      borderWidth: 2,
      borderStyle: "solid",
      borderRadius: "md",
      shadow: "sm",
    },
  },
];
