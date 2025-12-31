/**
 * @file ComponentPalette.tsx
 * @description Draggable component palette displaying available blocks, handles, and templates that can be added to the node composer
 */

import { useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import { PALETTE_CATEGORIES, BUILT_IN_TEMPLATES } from "../constants";
import type { PaletteItemDefinition, DragItem, NodeTemplate } from "../types";
import { useComposerStore } from "../composerStore";
import type { SavedNode } from "../composerApi";
import {
  Type,
  FileText,
  List,
  Code,
  Minus,
  Smile,
  Tag,
  Activity,
  MoveVertical,
  CircleDot,
  Circle,
  GripVertical,
  Heading,
  Zap,
  Terminal,
  Box,
  GitBranch,
  Cloud,
  Database,
} from "lucide-react";

// Icon mapping for palette items
const iconMap: Record<string, React.ElementType> = {
  type: Type,
  heading: Heading,
  "file-text": FileText,
  list: List,
  code: Code,
  minus: Minus,
  smile: Smile,
  tag: Tag,
  activity: Activity,
  "move-vertical": MoveVertical,
  "circle-dot": CircleDot,
  circle: Circle,
  zap: Zap,
  terminal: Terminal,
  box: Box,
  "git-branch": GitBranch,
  cloud: Cloud,
  database: Database,
};

// Template color mapping based on border color
const getTemplateColor = (template: NodeTemplate): string => {
  return template.style.borderColor || "#64748b";
};

interface PaletteItemProps {
  item: PaletteItemDefinition;
}

function PaletteItem({ item }: PaletteItemProps) {
  const dragData: DragItem = {
    type: item.type === "handle" ? "palette-handle" : "palette-block",
    blockType: item.blockType,
    handleType: item.handleType,
    handlePosition: item.handlePosition,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: dragData,
  });

  const Icon = iconMap[item.icon] || Circle;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md cursor-grab
        border border-transparent
        hover:bg-accent hover:border-border
        active:cursor-grabbing
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{item.label}</div>
          <div className="text-xs text-muted-foreground truncate">{item.description}</div>
        </div>
      </div>
    </div>
  );
}

export function ComponentPalette() {
  const { savedTemplates, isLoadingSavedTemplates, loadSavedTemplates } = useComposerStore();

  // Load user templates on mount
  useEffect(() => {
    void loadSavedTemplates();
  }, [loadSavedTemplates]);

  return (
    <div className="p-3">
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground px-1">Components</h3>
        <p className="text-xs text-muted-foreground px-1 mt-1">Drag items to the canvas</p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["handles", "content", "visual"]}
        className="space-y-1"
      >
        {PALETTE_CATEGORIES.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-none">
            <AccordionTrigger className="px-2 py-2 text-xs font-medium text-muted-foreground hover:no-underline hover:bg-accent rounded-md">
              {category.label}
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-2">
              <div className="space-y-1">
                {category.items.map((item) => (
                  <PaletteItem key={item.id} item={item} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* User saved nodes section */}
      {(savedTemplates.length > 0 || isLoadingSavedTemplates) && (
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground px-1 mb-3">
            My Saved Nodes
          </h3>
          {isLoadingSavedTemplates ? (
            <div className="text-xs text-muted-foreground px-3 py-2">Loading...</div>
          ) : (
            <div className="space-y-1">
              {savedTemplates.map((template) => (
                <SavedTemplateItem key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Built-in templates section */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground px-1 mb-3">
          Built-in Templates
        </h3>
        <div className="space-y-1">
          {BUILT_IN_TEMPLATES.map((template) => (
            <TemplateItem key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateItem({ template }: { template: NodeTemplate }) {
  const { applyTemplate } = useComposerStore();

  // Get the icon from the first header block if available
  const firstHeader = template.rows.find((r) => r.content?.type === "header");
  const iconValue =
    firstHeader?.content?.type === "header"
      ? (firstHeader.content as { icon?: { value: string } }).icon?.value
      : undefined;
  const Icon = iconValue ? iconMap[iconValue] || Circle : Circle;
  const color = getTemplateColor(template);

  return (
    <button
      onClick={() => applyTemplate(template)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
        border border-transparent
        hover:bg-accent hover:border-border
        transition-colors"
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{template.name}</div>
        <div className="text-xs text-muted-foreground truncate">{template.description}</div>
      </div>
    </button>
  );
}

function SavedTemplateItem({ template }: { template: SavedNode }) {
  const { applySavedTemplate } = useComposerStore();

  // Get border color from layout if available
  const color = template.layout?.style?.borderColor || "#64748b";

  return (
    <button
      onClick={() => applySavedTemplate(template)}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
        border border-transparent
        hover:bg-accent hover:border-border
        transition-colors"
    >
      <div
        className="flex items-center justify-center w-7 h-7 rounded"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Circle className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{template.name}</div>
        {template.description && (
          <div className="text-xs text-muted-foreground truncate">{template.description}</div>
        )}
      </div>
    </button>
  );
}
