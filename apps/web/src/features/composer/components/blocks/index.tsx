import type {
  ContentBlock,
  HeaderBlock,
  TextBlock,
  RichTextBlock,
  KeyValueBlock,
  CodeBlock,
  SeparatorBlock,
  IconBlock,
  BadgeBlock,
  StatusBlock,
  SpacerBlock,
} from "../../types";
import { BADGE_VARIANTS, STATUS_COLORS, FONT_SIZES, SPACER_HEIGHTS } from "../../constants";
import { NodeIconDisplay } from "../../../../components/ui/icon-picker";
import { cn } from "../../../../lib/utils";

interface BlockRendererProps {
  block: ContentBlock;
  preview?: boolean;
}

// Header block renderer
function HeaderBlockRenderer({ block, preview }: { block: HeaderBlock; preview?: boolean }) {
  return (
    <div
      className={cn("px-2 py-1.5", preview && "text-xs")}
      style={{
        backgroundColor: block.backgroundColor || "#f8fafc",
      }}
    >
      <div
        className={cn("font-medium flex items-center gap-1.5", preview ? "text-xs" : "text-sm")}
        style={{ color: block.textColor || "#1e293b" }}
      >
        {block.icon && (
          <NodeIconDisplay
            icon={block.icon}
            className={cn("flex-shrink-0", preview ? "h-3 w-3" : "h-4 w-4")}
          />
        )}
        {block.title}
      </div>
      {block.subtitle && (
        <div className={cn("text-muted-foreground mt-0.5", preview ? "text-[10px]" : "text-xs")}>
          {block.subtitle}
        </div>
      )}
    </div>
  );
}

// Text block renderer
function TextBlockRenderer({ block, preview }: { block: TextBlock; preview?: boolean }) {
  const fontSize = FONT_SIZES[block.fontSize || "sm"];
  const fontWeight = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }[block.fontWeight || "normal"];

  const iconElement = block.icon && (
    <NodeIconDisplay
      icon={block.icon}
      className={cn("flex-shrink-0", preview ? "h-3 w-3" : "h-4 w-4")}
    />
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1.5",
        preview && "text-xs truncate",
        block.iconPosition === "right" && "flex-row-reverse"
      )}
      style={{
        fontSize: preview ? "0.65rem" : fontSize,
        fontWeight,
        color: block.color || "inherit",
        justifyContent:
          block.align === "center" ? "center" : block.align === "right" ? "flex-end" : "flex-start",
      }}
    >
      {iconElement}
      <span className="whitespace-pre-wrap">{block.content}</span>
    </div>
  );
}

// Rich text block renderer
function RichTextBlockRenderer({ block, preview }: { block: RichTextBlock; preview?: boolean }) {
  if (preview) {
    // Strip HTML for preview
    const text = block.content.replace(/<[^>]*>/g, "");
    return (
      <div className="text-xs text-muted-foreground truncate">
        {text || block.placeholder || "Rich text"}
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
}

// Key-value block renderer
function KeyValueBlockRenderer({ block, preview }: { block: KeyValueBlock; preview?: boolean }) {
  if (preview) {
    return (
      <div className="text-xs text-muted-foreground truncate">
        {block.entries.length} key-value pairs
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", block.layout === "stacked" && "space-y-2")}>
      {block.entries.map((entry, index) => (
        <div
          key={index}
          className={cn(
            "text-sm",
            block.layout === "stacked" ? "flex flex-col" : "flex items-center gap-1"
          )}
        >
          <span style={{ color: entry.keyColor || "#64748b" }} className="font-medium">
            {entry.key}
          </span>
          <span className="text-muted-foreground">{block.separator || ":"}</span>
          <span style={{ color: entry.valueColor || "#1e293b" }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Code block renderer
function CodeBlockRenderer({ block, preview }: { block: CodeBlock; preview?: boolean }) {
  if (preview) {
    return (
      <div className="text-xs font-mono text-muted-foreground truncate bg-muted px-1 rounded">
        {block.content.substring(0, 20)}...
      </div>
    );
  }

  return (
    <pre className="bg-muted rounded-md p-2 overflow-x-auto">
      <code className="text-xs font-mono text-foreground">
        {block.showLineNumbers
          ? block.content.split("\n").map((line, i) => (
              <div key={i} className="flex">
                <span className="text-muted-foreground w-6 text-right mr-2 select-none">
                  {i + 1}
                </span>
                <span>{line}</span>
              </div>
            ))
          : block.content}
      </code>
    </pre>
  );
}

// Separator block renderer
function SeparatorBlockRenderer({ block, preview }: { block: SeparatorBlock; preview?: boolean }) {
  const margin = {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
  }[block.margin || "sm"];

  return (
    <hr
      style={{
        borderColor: block.color || "#e2e8f0",
        borderStyle: block.style || "solid",
        borderWidth: `${block.thickness || 1}px 0 0 0`,
        marginTop: margin,
        marginBottom: margin,
      }}
      className="w-full"
    />
  );
}

// Icon block renderer
function IconBlockRenderer({ block, preview }: { block: IconBlock; preview?: boolean }) {
  const size = preview ? "sm" : block.size || "md";
  const sizeMap: Record<string, string> = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };
  const sizeClass = sizeMap[size] || "h-5 w-5";

  return (
    <div className="flex items-center justify-center" style={{ color: block.color }}>
      <NodeIconDisplay icon={block.icon} className={cn("flex-shrink-0", sizeClass)} />
    </div>
  );
}

// Badge block renderer
function BadgeBlockRenderer({ block, preview }: { block: BadgeBlock; preview?: boolean }) {
  const variant = BADGE_VARIANTS[block.variant || "default"];
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  }[block.size || "sm"];

  return (
    <span
      className={cn("inline-flex items-center rounded-full font-medium", sizeClasses)}
      style={{
        backgroundColor: variant.bg,
        color: variant.text,
        borderColor: variant.border,
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      {block.text}
    </span>
  );
}

// Status block renderer
function StatusBlockRenderer({ block, preview }: { block: StatusBlock; preview?: boolean }) {
  const color =
    block.status === "custom"
      ? block.customColor || STATUS_COLORS.custom
      : STATUS_COLORS[block.status];

  return (
    <div className="flex items-center gap-1.5">
      {block.showDot !== false && (
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      )}
      {block.label && <span className={cn("text-sm", preview && "text-xs")}>{block.label}</span>}
    </div>
  );
}

// Spacer block renderer
function SpacerBlockRenderer({ block }: { block: SpacerBlock }) {
  const height = SPACER_HEIGHTS[block.height];

  return <div style={{ height }} />;
}

// Main block renderer component
export function BlockRenderer({ block, preview = false }: BlockRendererProps) {
  switch (block.type) {
    case "header":
      return <HeaderBlockRenderer block={block} preview={preview} />;
    case "text":
      return <TextBlockRenderer block={block} preview={preview} />;
    case "richtext":
      return <RichTextBlockRenderer block={block} preview={preview} />;
    case "keyvalue":
      return <KeyValueBlockRenderer block={block} preview={preview} />;
    case "code":
      return <CodeBlockRenderer block={block} preview={preview} />;
    case "separator":
      return <SeparatorBlockRenderer block={block} preview={preview} />;
    case "icon":
      return <IconBlockRenderer block={block} preview={preview} />;
    case "badge":
      return <BadgeBlockRenderer block={block} preview={preview} />;
    case "status":
      return <StatusBlockRenderer block={block} preview={preview} />;
    case "spacer":
      return <SpacerBlockRenderer block={block} />;
    default:
      return <div className="text-xs text-muted-foreground">Unknown block type</div>;
  }
}
