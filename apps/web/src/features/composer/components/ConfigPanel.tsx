import { useComposerStore } from "../composerStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Input } from "../../../components/ui/input";
import { ColorPicker, ColorSwatch } from "../../../components/ui/color-picker";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/toggle-group";
import { Switch } from "../../../components/ui/switch";
import { IconPicker, NodeIconDisplay } from "../../../components/ui/icon-picker";
import { X } from "lucide-react";
import { BACKGROUND_COLOR_PRESETS, BORDER_COLOR_PRESETS, TEXT_COLOR_PRESETS } from "../constants";
import type {
  BorderRadius,
  ShadowSize,
  BorderStyle,
  RowPadding,
  ContentBlock,
  HeaderBlock,
  TextBlock,
  BadgeBlock,
  StatusBlock,
  SeparatorBlock,
  KeyValueBlock,
  FontSize,
  FontWeight,
  BadgeVariant,
  SeparatorStyle,
} from "../types";
import type { NodeIcon } from "../../../store/graphStore";

// Row configuration panel
function RowConfig() {
  const { currentLayout, selectedRowId, updateRow } = useComposerStore();

  const selectedRow = currentLayout?.rows.find((r) => r.id === selectedRowId);

  if (!selectedRow) {
    return <div className="p-4 text-sm text-muted-foreground">Select a row to configure</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-medium text-muted-foreground">Padding</label>
        <ToggleGroup
          type="single"
          value={selectedRow.padding || "sm"}
          onValueChange={(value) =>
            value && updateRow(selectedRow.id, { padding: value as RowPadding })
          }
          className="h-7 rounded-md border border-border bg-background"
        >
          <ToggleGroupItem
            value="none"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            None
          </ToggleGroupItem>
          <ToggleGroupItem
            value="xs"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            XS
          </ToggleGroupItem>
          <ToggleGroupItem
            value="sm"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            SM
          </ToggleGroupItem>
          <ToggleGroupItem
            value="md"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            MD
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Background</label>
        <div className="flex items-center gap-2 mt-1.5">
          <ColorPicker
            value={selectedRow.backgroundColor || "transparent"}
            onChange={(color) => updateRow(selectedRow.id, { backgroundColor: color })}
          >
            <button className="w-8 h-8 rounded border border-border">
              <ColorSwatch
                color={selectedRow.backgroundColor || "transparent"}
                className="w-full h-full rounded"
              />
            </button>
          </ColorPicker>
          <div className="flex gap-1">
            {BACKGROUND_COLOR_PRESETS.slice(0, 4).map((color) => (
              <button
                key={color}
                onClick={() => updateRow(selectedRow.id, { backgroundColor: color })}
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Handle configuration panel
function HandleConfig() {
  const { currentLayout, selectedRowId, selectedElementType, updateRowHandle } = useComposerStore();

  const selectedRow = currentLayout?.rows.find((r) => r.id === selectedRowId);
  const handle =
    selectedElementType === "leftHandle"
      ? selectedRow?.leftHandle
      : selectedElementType === "rightHandle"
        ? selectedRow?.rightHandle
        : null;
  const position = selectedElementType === "leftHandle" ? "left" : "right";

  if (!handle || !selectedRow) {
    return <div className="p-4 text-sm text-muted-foreground">Select a handle to configure</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Label</label>
        <Input
          value={handle.label || ""}
          onChange={(e) => updateRowHandle(selectedRow.id, position, { label: e.target.value })}
          placeholder="Handle label"
          className="mt-1.5"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Color</label>
        <div className="flex items-center gap-2 mt-1.5">
          <ColorPicker
            value={handle.color || "#64748b"}
            onChange={(color) => updateRowHandle(selectedRow.id, position, { color })}
          >
            <button className="w-8 h-8 rounded border border-border">
              <ColorSwatch color={handle.color || "#64748b"} className="w-full h-full rounded" />
            </button>
          </ColorPicker>
          <div className="flex gap-1">
            {BORDER_COLOR_PRESETS.slice(0, 4).map((color) => (
              <button
                key={color}
                onClick={() => updateRowHandle(selectedRow.id, position, { color })}
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Type: <span className="font-medium">{handle.type === "target" ? "Input" : "Output"}</span>
        </div>
      </div>
    </div>
  );
}

// Content block configuration panel
function ContentConfig() {
  const currentLayout = useComposerStore((s) => s.currentLayout);
  const selectedRowId = useComposerStore((s) => s.selectedRowId);
  const updateRowContent = useComposerStore((s) => s.updateRowContent);

  const selectedRow = currentLayout?.rows.find((r) => r.id === selectedRowId);
  const content = selectedRow?.content;

  if (!content || !selectedRow) {
    return <div className="p-4 text-sm text-muted-foreground">Select content to configure</div>;
  }

  // Header block config
  if (content.type === "header") {
    const headerBlock = content as HeaderBlock;
    return (
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <Input
            value={headerBlock.title}
            onChange={(e) => updateRowContent(selectedRow.id, { title: e.target.value })}
            placeholder="Header title"
            className="mt-1.5"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Subtitle</label>
          <Input
            value={headerBlock.subtitle || ""}
            onChange={(e) =>
              updateRowContent(selectedRow.id, { subtitle: e.target.value || undefined })
            }
            placeholder="Optional subtitle"
            className="mt-1.5"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Icon</label>
          <div className="flex items-center gap-2 mt-1.5">
            <IconPicker
              value={headerBlock.icon}
              onChange={(icon: NodeIcon) => updateRowContent(selectedRow.id, { icon })}
            >
              <button className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted">
                {headerBlock.icon ? (
                  <NodeIconDisplay icon={headerBlock.icon} className="h-4 w-4" />
                ) : (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </button>
            </IconPicker>
            {headerBlock.icon && (
              <button
                onClick={() => updateRowContent(selectedRow.id, { icon: undefined })}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Background Color</label>
          <div className="flex items-center gap-2 mt-1.5">
            <ColorPicker
              value={headerBlock.backgroundColor || "#f8fafc"}
              onChange={(color) => updateRowContent(selectedRow.id, { backgroundColor: color })}
            >
              <button className="w-8 h-8 rounded border border-border">
                <ColorSwatch
                  color={headerBlock.backgroundColor || "#f8fafc"}
                  className="w-full h-full rounded"
                />
              </button>
            </ColorPicker>
            <div className="flex gap-1">
              {BACKGROUND_COLOR_PRESETS.slice(0, 4).map((color) => (
                <button
                  key={color}
                  onClick={() => updateRowContent(selectedRow.id, { backgroundColor: color })}
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Text Color</label>
          <div className="flex items-center gap-2 mt-1.5">
            <ColorPicker
              value={headerBlock.textColor || "#1e293b"}
              onChange={(color) => updateRowContent(selectedRow.id, { textColor: color })}
            >
              <button className="w-8 h-8 rounded border border-border">
                <ColorSwatch
                  color={headerBlock.textColor || "#1e293b"}
                  className="w-full h-full rounded"
                />
              </button>
            </ColorPicker>
            <div className="flex gap-1">
              {TEXT_COLOR_PRESETS.slice(0, 4).map((color) => (
                <button
                  key={color}
                  onClick={() => updateRowContent(selectedRow.id, { textColor: color })}
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Text block config
  if (content.type === "text") {
    const textBlock = content as TextBlock;
    return (
      <div
        key={`text-${selectedRow.id}-${textBlock.fontSize}-${textBlock.fontWeight}`}
        className="p-4 space-y-4"
      >
        <div>
          <label className="text-xs font-medium text-muted-foreground">Content</label>
          <Input
            value={textBlock.content}
            onChange={(e) => updateRowContent(selectedRow.id, { content: e.target.value })}
            placeholder="Text content"
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Font Size</label>
          <ToggleGroup
            type="single"
            value={textBlock.fontSize || "sm"}
            onValueChange={(value) =>
              value && updateRowContent(selectedRow.id, { fontSize: value as FontSize })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="xs"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              XS
            </ToggleGroupItem>
            <ToggleGroupItem
              value="sm"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              SM
            </ToggleGroupItem>
            <ToggleGroupItem
              value="md"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              MD
            </ToggleGroupItem>
            <ToggleGroupItem
              value="lg"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              LG
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Font Weight</label>
          <ToggleGroup
            type="single"
            value={textBlock.fontWeight || "normal"}
            onValueChange={(value) =>
              value && updateRowContent(selectedRow.id, { fontWeight: value as FontWeight })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="normal"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Normal
            </ToggleGroupItem>
            <ToggleGroupItem
              value="medium"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Medium
            </ToggleGroupItem>
            <ToggleGroupItem
              value="semibold"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Semi
            </ToggleGroupItem>
            <ToggleGroupItem
              value="bold"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Bold
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <div className="flex items-center gap-2 mt-1.5">
            <ColorPicker
              value={textBlock.color || "#1e293b"}
              onChange={(color) => updateRowContent(selectedRow.id, { color })}
            >
              <button className="w-8 h-8 rounded border border-border">
                <ColorSwatch
                  color={textBlock.color || "#1e293b"}
                  className="w-full h-full rounded"
                />
              </button>
            </ColorPicker>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Icon</label>
          <div className="flex items-center gap-2 mt-1.5">
            <IconPicker
              value={textBlock.icon}
              onChange={(icon: NodeIcon) => updateRowContent(selectedRow.id, { icon })}
            >
              <button className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted">
                {textBlock.icon ? (
                  <NodeIconDisplay icon={textBlock.icon} className="h-4 w-4" />
                ) : (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </button>
            </IconPicker>
            {textBlock.icon && (
              <button
                onClick={() => updateRowContent(selectedRow.id, { icon: undefined })}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {textBlock.icon && (
              <ToggleGroup
                type="single"
                value={textBlock.iconPosition || "left"}
                onValueChange={(value) =>
                  value &&
                  updateRowContent(selectedRow.id, { iconPosition: value as "left" | "right" })
                }
                className="h-7 rounded-md border border-border bg-background"
              >
                <ToggleGroupItem
                  value="left"
                  className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                  variant="ghost"
                >
                  Left
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="right"
                  className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
                  variant="ghost"
                >
                  Right
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Badge block config
  if (content.type === "badge") {
    const badgeBlock = content as BadgeBlock;
    return (
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Text</label>
          <Input
            value={badgeBlock.text}
            onChange={(e) => updateRowContent(selectedRow.id, { text: e.target.value })}
            placeholder="Badge text"
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Variant</label>
          <ToggleGroup
            type="single"
            value={badgeBlock.variant || "default"}
            onValueChange={(value) =>
              value && updateRowContent(selectedRow.id, { variant: value as BadgeVariant })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="default"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Default
            </ToggleGroupItem>
            <ToggleGroupItem
              value="success"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Success
            </ToggleGroupItem>
            <ToggleGroupItem
              value="warning"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Warning
            </ToggleGroupItem>
            <ToggleGroupItem
              value="error"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Error
            </ToggleGroupItem>
            <ToggleGroupItem
              value="info"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Info
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  // Separator block config
  if (content.type === "separator") {
    const separatorBlock = content as SeparatorBlock;
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Style</label>
          <ToggleGroup
            type="single"
            value={separatorBlock.style || "solid"}
            onValueChange={(value) =>
              value && updateRowContent(selectedRow.id, { style: value as SeparatorStyle })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="solid"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Solid
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dashed"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Dashed
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dotted"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Dotted
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <div className="flex items-center gap-2 mt-1.5">
            <ColorPicker
              value={separatorBlock.color || "#e2e8f0"}
              onChange={(color) => updateRowContent(selectedRow.id, { color })}
            >
              <button className="w-8 h-8 rounded border border-border">
                <ColorSwatch
                  color={separatorBlock.color || "#e2e8f0"}
                  className="w-full h-full rounded"
                />
              </button>
            </ColorPicker>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="p-4 text-sm text-muted-foreground">
      Configuration for {content.type} blocks coming soon
    </div>
  );
}

// Global style configuration panel
function StyleConfig() {
  const { currentLayout, updateStyle, updateLayoutName, setHeader, updateHeader } =
    useComposerStore();

  if (!currentLayout) {
    return null;
  }

  const style = currentLayout.style;
  const header = currentLayout.header;

  const handleToggleHeader = (enabled: boolean) => {
    if (enabled) {
      setHeader({
        title: "Title",
        backgroundColor: "#f8fafc",
        textColor: "#1e293b",
      });
    } else {
      setHeader(undefined);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Name</label>
        <Input
          value={currentLayout.name}
          onChange={(e) => updateLayoutName(e.target.value)}
          placeholder="Node name"
          className="mt-1.5"
        />
      </div>

      {/* Header Section */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium text-muted-foreground">Header</label>
          <Switch checked={!!header} onCheckedChange={handleToggleHeader} />
        </div>

        {header && (
          <div className="space-y-3 pl-2 border-l-2 border-muted">
            <div>
              <label className="text-xs text-muted-foreground">Title</label>
              <Input
                value={header.title}
                onChange={(e) => updateHeader({ title: e.target.value })}
                placeholder="Node title"
                className="mt-1 h-8"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Subtitle</label>
              <Input
                value={header.subtitle || ""}
                onChange={(e) => updateHeader({ subtitle: e.target.value || undefined })}
                placeholder="Optional subtitle"
                className="mt-1 h-8"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Icon</label>
              <div className="flex items-center gap-2 mt-1">
                <IconPicker
                  value={header.icon}
                  onChange={(icon: NodeIcon) => updateHeader({ icon })}
                >
                  <button className="w-8 h-8 rounded border border-border flex items-center justify-center hover:bg-muted">
                    {header.icon ? (
                      <NodeIconDisplay icon={header.icon} className="h-4 w-4" />
                    ) : (
                      <span className="text-xs text-muted-foreground">+</span>
                    )}
                  </button>
                </IconPicker>
                {header.icon && (
                  <button
                    onClick={() => updateHeader({ icon: undefined })}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Background</label>
                <div className="mt-1">
                  <ColorPicker
                    value={header.backgroundColor || "#f8fafc"}
                    onChange={(color) => updateHeader({ backgroundColor: color })}
                  >
                    <button className="w-8 h-8 rounded border border-border">
                      <ColorSwatch
                        color={header.backgroundColor || "#f8fafc"}
                        className="w-full h-full rounded"
                      />
                    </button>
                  </ColorPicker>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Text Color</label>
                <div className="mt-1">
                  <ColorPicker
                    value={header.textColor || "#1e293b"}
                    onChange={(color) => updateHeader({ textColor: color })}
                  >
                    <button className="w-8 h-8 rounded border border-border">
                      <ColorSwatch
                        color={header.textColor || "#1e293b"}
                        className="w-full h-full rounded"
                      />
                    </button>
                  </ColorPicker>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <label className="text-xs font-medium text-muted-foreground block mb-3">Node Style</label>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Background</label>
        <div className="flex items-center gap-2 mt-1.5">
          <ColorPicker
            value={style.backgroundColor}
            onChange={(color) => updateStyle({ backgroundColor: color })}
          >
            <button className="w-8 h-8 rounded border border-border">
              <ColorSwatch color={style.backgroundColor} className="w-full h-full rounded" />
            </button>
          </ColorPicker>
          <div className="flex gap-1 flex-wrap">
            {BACKGROUND_COLOR_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => updateStyle({ backgroundColor: color })}
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground">Border Color</label>
        <div className="flex items-center gap-2 mt-1.5">
          <ColorPicker
            value={style.borderColor || "#e2e8f0"}
            onChange={(color) => updateStyle({ borderColor: color })}
          >
            <button className="w-8 h-8 rounded border border-border">
              <ColorSwatch
                color={style.borderColor || "#e2e8f0"}
                className="w-full h-full rounded"
              />
            </button>
          </ColorPicker>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-medium text-muted-foreground">Border Width</label>
        <ToggleGroup
          type="single"
          value={String(style.borderWidth ?? 1)}
          onValueChange={(value) => value && updateStyle({ borderWidth: parseInt(value) })}
          className="h-7 rounded-md border border-border bg-background"
        >
          <ToggleGroupItem
            value="0"
            className="h-full w-8 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            0
          </ToggleGroupItem>
          <ToggleGroupItem
            value="1"
            className="h-full w-8 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            1
          </ToggleGroupItem>
          <ToggleGroupItem
            value="2"
            className="h-full w-8 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            2
          </ToggleGroupItem>
          <ToggleGroupItem
            value="3"
            className="h-full w-8 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            3
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-medium text-muted-foreground">Border Style</label>
        <ToggleGroup
          type="single"
          value={style.borderStyle || "solid"}
          onValueChange={(value) => value && updateStyle({ borderStyle: value as BorderStyle })}
          className="h-7 rounded-md border border-border bg-background"
        >
          <ToggleGroupItem
            value="solid"
            className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            Solid
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dashed"
            className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            Dashed
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dotted"
            className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            Dotted
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-medium text-muted-foreground">Border Radius</label>
        <ToggleGroup
          type="single"
          value={style.borderRadius || "md"}
          onValueChange={(value) => value && updateStyle({ borderRadius: value as BorderRadius })}
          className="h-7 rounded-md border border-border bg-background"
        >
          <ToggleGroupItem
            value="none"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            None
          </ToggleGroupItem>
          <ToggleGroupItem
            value="sm"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            SM
          </ToggleGroupItem>
          <ToggleGroupItem
            value="md"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            MD
          </ToggleGroupItem>
          <ToggleGroupItem
            value="lg"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            LG
          </ToggleGroupItem>
          <ToggleGroupItem
            value="full"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            Full
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-medium text-muted-foreground">Shadow</label>
        <ToggleGroup
          type="single"
          value={style.shadow || "sm"}
          onValueChange={(value) => value && updateStyle({ shadow: value as ShadowSize })}
          className="h-7 rounded-md border border-border bg-background"
        >
          <ToggleGroupItem
            value="none"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            None
          </ToggleGroupItem>
          <ToggleGroupItem
            value="sm"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            SM
          </ToggleGroupItem>
          <ToggleGroupItem
            value="md"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            MD
          </ToggleGroupItem>
          <ToggleGroupItem
            value="lg"
            className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            LG
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

export function ConfigPanel() {
  const { selectedRowId, selectedElementType } = useComposerStore();

  // Determine which tab to show based on selection
  const activeTab = (() => {
    if (!selectedRowId) return "style";
    if (selectedElementType === "content") return "content";
    if (selectedElementType === "leftHandle" || selectedElementType === "rightHandle")
      return "handle";
    return "row";
  })();

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="row"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
          >
            Row
          </TabsTrigger>
          <TabsTrigger
            value="handle"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
          >
            Handle
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
          >
            Content
          </TabsTrigger>
          <TabsTrigger
            value="style"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4"
          >
            Style
          </TabsTrigger>
        </TabsList>

        <TabsContent value="row" className="flex-1 overflow-y-auto mt-0">
          <RowConfig />
        </TabsContent>

        <TabsContent value="handle" className="flex-1 overflow-y-auto mt-0">
          <HandleConfig />
        </TabsContent>

        <TabsContent value="content" className="flex-1 overflow-y-auto mt-0">
          <ContentConfig />
        </TabsContent>

        <TabsContent value="style" className="flex-1 overflow-y-auto mt-0">
          <StyleConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
