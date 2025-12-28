import React from "react";
import { useComposerStore } from "../composerStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { ColorPicker, ColorSwatch } from "../../../components/ui/color-picker";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/toggle-group";
import { Switch } from "../../../components/ui/switch";
import { IconPicker, NodeIconDisplay } from "../../../components/ui/icon-picker";
import { X, Plus, Trash2 } from "lucide-react";
import { BACKGROUND_COLOR_PRESETS, BORDER_COLOR_PRESETS, TEXT_COLOR_PRESETS } from "../constants";
import type {
  BorderRadius,
  ShadowSize,
  BorderStyle,
  RowPadding,
  HeaderBlock,
  TextBlock,
  BadgeBlock,
  StatusBlock,
  SeparatorBlock,
  KeyValueBlock,
  CodeBlock,
  IconBlock,
  SpacerBlock,
  RichTextBlock,
  FontSize,
  FontWeight,
  BadgeVariant,
  SeparatorStyle,
  StatusType,
  SpacerSize,
  LabelPosition,
  HandleStyle,
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

      {handle.label && (
        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Label Position</label>
          <ToggleGroup
            type="single"
            value={handle.labelPosition || "outside"}
            onValueChange={(value) =>
              value &&
              updateRowHandle(selectedRow.id, position, { labelPosition: value as LabelPosition })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="inside"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Inside
            </ToggleGroupItem>
            <ToggleGroupItem
              value="outside"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Outside
            </ToggleGroupItem>
            <ToggleGroupItem
              value="hidden"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Hidden
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

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

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-medium text-muted-foreground">Style</label>
        <ToggleGroup
          type="single"
          value={handle.style || "outlined"}
          onValueChange={(value) =>
            value && updateRowHandle(selectedRow.id, position, { style: value as HandleStyle })
          }
          className="h-7 rounded-md border border-border bg-background"
        >
          <ToggleGroupItem
            value="outlined"
            className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            Outlined
          </ToggleGroupItem>
          <ToggleGroupItem
            value="filled"
            className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            Filled
          </ToggleGroupItem>
        </ToggleGroup>
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

  // Code block config
  if (content.type === "code") {
    const codeBlock = content as CodeBlock;
    return (
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Code</label>
          <Textarea
            value={codeBlock.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateRowContent(selectedRow.id, { content: e.target.value })
            }
            placeholder="Enter code..."
            className="mt-1.5 font-mono text-xs min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Language</label>
          <Input
            value={codeBlock.language || ""}
            onChange={(e) =>
              updateRowContent(selectedRow.id, { language: e.target.value || undefined })
            }
            placeholder="e.g., javascript, python"
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Show Line Numbers</label>
          <Switch
            checked={codeBlock.showLineNumbers ?? false}
            onCheckedChange={(checked) =>
              updateRowContent(selectedRow.id, { showLineNumbers: checked })
            }
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Theme</label>
          <ToggleGroup
            type="single"
            value={codeBlock.theme || "light"}
            onValueChange={(value) => {
              if (value) updateRowContent(selectedRow.id, { theme: value as "light" | "dark" });
            }}
            className="mt-1.5 h-8 rounded-md border border-border bg-background justify-start"
          >
            <ToggleGroupItem
              value="light"
              className="h-full px-3 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Light
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              className="h-full px-3 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  // Icon block config
  if (content.type === "icon") {
    const iconBlock = content as IconBlock;
    return (
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Icon</label>
          <div className="flex items-center gap-2 mt-1.5">
            <IconPicker
              value={iconBlock.icon}
              onChange={(icon: NodeIcon) => updateRowContent(selectedRow.id, { icon })}
            >
              <button className="w-10 h-10 rounded border border-border flex items-center justify-center hover:bg-muted">
                {iconBlock.icon ? (
                  <NodeIconDisplay icon={iconBlock.icon} className="h-5 w-5" />
                ) : (
                  <span className="text-xs text-muted-foreground">+</span>
                )}
              </button>
            </IconPicker>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Size</label>
          <ToggleGroup
            type="single"
            value={iconBlock.size || "md"}
            onValueChange={(value) =>
              value &&
              updateRowContent(selectedRow.id, { size: value as "xs" | "sm" | "md" | "lg" | "xl" })
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
            <ToggleGroupItem
              value="xl"
              className="h-full px-2 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              XL
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <div className="flex items-center gap-2 mt-1.5">
            <ColorPicker
              value={iconBlock.color || "#64748b"}
              onChange={(color) => updateRowContent(selectedRow.id, { color })}
            >
              <button className="w-8 h-8 rounded border border-border">
                <ColorSwatch
                  color={iconBlock.color || "#64748b"}
                  className="w-full h-full rounded"
                />
              </button>
            </ColorPicker>
            <div className="flex gap-1">
              {TEXT_COLOR_PRESETS.slice(0, 4).map((color) => (
                <button
                  key={color}
                  onClick={() => updateRowContent(selectedRow.id, { color })}
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

  // Status block config
  if (content.type === "status") {
    const statusBlock = content as StatusBlock;
    return (
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Label</label>
          <Input
            value={statusBlock.label || ""}
            onChange={(e) =>
              updateRowContent(selectedRow.id, { label: e.target.value || undefined })
            }
            placeholder="Status label"
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <ToggleGroup
            type="single"
            value={statusBlock.status || "active"}
            onValueChange={(value) =>
              value && updateRowContent(selectedRow.id, { status: value as StatusType })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="active"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Active
            </ToggleGroupItem>
            <ToggleGroupItem
              value="inactive"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Inactive
            </ToggleGroupItem>
            <ToggleGroupItem
              value="pending"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Pending
            </ToggleGroupItem>
            <ToggleGroupItem
              value="error"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Error
            </ToggleGroupItem>
            <ToggleGroupItem
              value="custom"
              className="h-full px-1.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Custom
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {statusBlock.status === "custom" && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Custom Color</label>
            <div className="flex items-center gap-2 mt-1.5">
              <ColorPicker
                value={statusBlock.customColor || "#64748b"}
                onChange={(color) => updateRowContent(selectedRow.id, { customColor: color })}
              >
                <button className="w-8 h-8 rounded border border-border">
                  <ColorSwatch
                    color={statusBlock.customColor || "#64748b"}
                    className="w-full h-full rounded"
                  />
                </button>
              </ColorPicker>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Show Dot</label>
          <Switch
            checked={statusBlock.showDot ?? true}
            onCheckedChange={(checked) => updateRowContent(selectedRow.id, { showDot: checked })}
          />
        </div>
      </div>
    );
  }

  // Spacer block config
  if (content.type === "spacer") {
    const spacerBlock = content as SpacerBlock;
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Height</label>
          <ToggleGroup
            type="single"
            value={spacerBlock.height || "md"}
            onValueChange={(value) =>
              value && updateRowContent(selectedRow.id, { height: value as SpacerSize })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="xs"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              XS
            </ToggleGroupItem>
            <ToggleGroupItem
              value="sm"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              SM
            </ToggleGroupItem>
            <ToggleGroupItem
              value="md"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              MD
            </ToggleGroupItem>
            <ToggleGroupItem
              value="lg"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              LG
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  // Key-value block config
  if (content.type === "keyvalue") {
    const kvBlock = content as KeyValueBlock;
    const entries = kvBlock.entries || [];

    const updateEntries = (newEntries: typeof entries) => {
      updateRowContent(selectedRow.id, { entries: newEntries });
    };

    const addEntry = () => {
      updateEntries([...entries, { key: "", value: "" }]);
    };

    const removeEntry = (index: number) => {
      updateEntries(entries.filter((_, i) => i !== index));
    };

    const updateEntry = (index: number, field: "key" | "value", newValue: string) => {
      const newEntries = entries.map((entry, i) =>
        i === index ? { ...entry, [field]: newValue } : entry
      );
      updateEntries(newEntries);
    };

    return (
      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted-foreground">Entries</label>
            <Button variant="ghost" size="sm" onClick={addEntry} className="h-6 px-2">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={entry.key}
                  onChange={(e) => updateEntry(index, "key", e.target.value)}
                  placeholder="Key"
                  className="h-8 text-xs flex-1"
                />
                <Input
                  value={entry.value}
                  onChange={(e) => updateEntry(index, "value", e.target.value)}
                  placeholder="Value"
                  className="h-8 text-xs flex-1"
                />
                <button
                  onClick={() => removeEntry(index)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-2">
                No entries. Click "Add" to create one.
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Separator</label>
          <Input
            value={kvBlock.separator || ":"}
            onChange={(e) => updateRowContent(selectedRow.id, { separator: e.target.value })}
            placeholder=":"
            className="mt-1.5 w-16"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-medium text-muted-foreground">Layout</label>
          <ToggleGroup
            type="single"
            value={kvBlock.layout || "inline"}
            onValueChange={(value) =>
              value && updateRowContent(selectedRow.id, { layout: value as "inline" | "stacked" })
            }
            className="h-7 rounded-md border border-border bg-background"
          >
            <ToggleGroupItem
              value="inline"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Inline
            </ToggleGroupItem>
            <ToggleGroupItem
              value="stacked"
              className="h-full px-2.5 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
              variant="ghost"
            >
              Stacked
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  // Rich text block config
  if (content.type === "richtext") {
    const richTextBlock = content as RichTextBlock;
    return (
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Content (HTML)</label>
          <Textarea
            value={richTextBlock.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateRowContent(selectedRow.id, { content: e.target.value })
            }
            placeholder="<p>Rich text content...</p>"
            className="mt-1.5 font-mono text-xs min-h-[100px]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Placeholder</label>
          <Input
            value={richTextBlock.placeholder || ""}
            onChange={(e) =>
              updateRowContent(selectedRow.id, { placeholder: e.target.value || undefined })
            }
            placeholder="Enter placeholder text..."
            className="mt-1.5"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Editable at Runtime</label>
          <Switch
            checked={richTextBlock.editable ?? false}
            onCheckedChange={(checked) => updateRowContent(selectedRow.id, { editable: checked })}
          />
        </div>
      </div>
    );
  }

  // Default fallback (should not reach here since all types are handled)
  return (
    <div className="p-4 text-sm text-muted-foreground">
      Configuration for this block type coming soon
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
      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <label className="text-xs text-muted-foreground">Title</label>
        <Switch checked={!!header} onCheckedChange={handleToggleHeader} />
      </div>

      {header && (
        <div className="space-y-3 ml-3 pl-3 border-l-2 border-border">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-muted-foreground">Title</label>
            <Input
              value={header.title}
              onChange={(e) => updateHeader({ title: e.target.value })}
              placeholder="Node title"
              className="h-7 w-32 text-xs"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-muted-foreground">Subtitle</label>
            <Input
              value={header.subtitle || ""}
              onChange={(e) => updateHeader({ subtitle: e.target.value || undefined })}
              placeholder="Optional"
              className="h-7 w-32 text-xs"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-muted-foreground">Icon</label>
            <div className="flex items-center gap-1">
              <IconPicker value={header.icon} onChange={(icon: NodeIcon) => updateHeader({ icon })}>
                <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-secondary">
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
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-muted-foreground">Background</label>
            <ColorPicker
              value={header.backgroundColor || "#f8fafc"}
              onChange={(color) => updateHeader({ backgroundColor: color })}
            >
              <button className="flex h-7 w-7 items-center justify-center cursor-pointer">
                <ColorSwatch color={header.backgroundColor || "#f8fafc"} className="h-5 w-5" />
              </button>
            </ColorPicker>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs text-muted-foreground">Text</label>
            <ColorPicker
              value={header.textColor || "#1e293b"}
              onChange={(color) => updateHeader({ textColor: color })}
            >
              <button className="flex h-7 w-7 items-center justify-center cursor-pointer">
                <ColorSwatch color={header.textColor || "#1e293b"} className="h-5 w-5" />
              </button>
            </ColorPicker>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
        <label className="text-xs font-medium text-muted-foreground">Size</label>
        <ToggleGroup
          type="single"
          value={style.minWidth === 100 ? "sm" : style.minWidth === 200 ? "lg" : "md"}
          onValueChange={(value) => {
            if (value === "sm") updateStyle({ minWidth: 100, maxWidth: 250 });
            else if (value === "md") updateStyle({ minWidth: 150, maxWidth: 400 });
            else if (value === "lg") updateStyle({ minWidth: 200, maxWidth: 500 });
          }}
          className="h-7 rounded-md border border-border bg-background"
        >
          <ToggleGroupItem
            value="sm"
            className="h-full px-3 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            S
          </ToggleGroupItem>
          <ToggleGroupItem
            value="md"
            className="h-full px-3 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            M
          </ToggleGroupItem>
          <ToggleGroupItem
            value="lg"
            className="h-full px-3 rounded-none border-r border-border text-xs text-muted-foreground first:rounded-l-[5px] last:rounded-r-[5px] last:border-r-0 hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
            variant="ghost"
          >
            L
          </ToggleGroupItem>
        </ToggleGroup>
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
