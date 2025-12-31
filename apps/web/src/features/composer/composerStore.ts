/**
 * @file composerStore.ts
 * @description Zustand store for node composer state management, handling layout editing, row operations, handle management, content blocks, and template functionality
 */

import { create } from "zustand";
import {
  type ComposedNodeLayout,
  type ComposedRow,
  type ComposedHandle,
  type ContentBlock,
  type ComposerMode,
  type NodeTemplate,
  type ComposedHeader,
  type ComposedFooter,
  type ComposedNodeStyle,
  createDefaultLayout,
  createDefaultRow,
} from "./types";
import {
  listSavedNodes,
  createSavedNode,
  updateSavedNode,
  deleteSavedNode,
  type SavedNode,
  type SavedNodesQuota,
} from "./composerApi";

// Generate unique IDs
const generateId = () => crypto.randomUUID();

interface ComposerState {
  // Modal state
  isOpen: boolean;
  mode: ComposerMode;
  targetNodeId?: string; // For editing existing node in graph
  targetTemplateId?: string; // For editing existing saved template

  // Current layout being edited
  currentLayout: ComposedNodeLayout | null;

  // Selection state
  selectedRowId: string | null;
  selectedElementType: "row" | "leftHandle" | "rightHandle" | "content" | null;

  // Saved templates (user's saved nodes from backend)
  savedTemplates: SavedNode[];
  savedTemplatesQuota: SavedNodesQuota | null;
  isLoadingSavedTemplates: boolean;
  savedTemplatesError: string | null;

  // Built-in templates (legacy, kept for backwards compat)
  templates: NodeTemplate[];
  isLoadingTemplates: boolean;

  // Modal actions
  openComposer: (mode: ComposerMode, nodeId?: string, layout?: ComposedNodeLayout) => void;
  openTemplateEditor: (templateId?: string) => void; // Open composer for template create/edit
  closeComposer: () => void;

  // Layout actions
  setLayout: (layout: ComposedNodeLayout) => void;
  resetLayout: () => void;
  updateLayoutName: (name: string) => void;
  updateLayoutDescription: (description: string) => void;

  // Header actions
  setHeader: (header: ComposedHeader | undefined) => void;
  updateHeader: (updates: Partial<ComposedHeader>) => void;

  // Footer actions
  setFooter: (footer: ComposedFooter | undefined) => void;
  updateFooter: (updates: Partial<ComposedFooter>) => void;

  // Style actions
  updateStyle: (updates: Partial<ComposedNodeStyle>) => void;

  // Row actions
  addRow: (index?: number) => string; // Returns new row ID
  updateRow: (rowId: string, updates: Partial<ComposedRow>) => void;
  removeRow: (rowId: string) => void;
  reorderRows: (startIndex: number, endIndex: number) => void;
  duplicateRow: (rowId: string) => string | null; // Returns new row ID

  // Handle actions
  setRowHandle: (
    rowId: string,
    position: "left" | "right",
    handle: ComposedHandle | undefined
  ) => void;
  updateRowHandle: (
    rowId: string,
    position: "left" | "right",
    updates: Partial<ComposedHandle>
  ) => void;

  // Content actions
  setRowContent: (rowId: string, content: ContentBlock | undefined) => void;
  updateRowContent: (rowId: string, updates: Partial<ContentBlock>) => void;

  // Selection actions
  selectRow: (rowId: string | null) => void;
  selectElement: (
    rowId: string | null,
    elementType: "row" | "leftHandle" | "rightHandle" | "content" | null
  ) => void;
  clearSelection: () => void;

  // Template actions (legacy built-in templates)
  loadTemplates: () => Promise<void>;
  saveAsTemplate: (name: string, description?: string) => Promise<NodeTemplate | null>;
  deleteTemplate: (templateId: string) => Promise<void>;
  applyTemplate: (template: NodeTemplate) => void;

  // Saved template actions (backend-stored user templates)
  loadSavedTemplates: () => Promise<void>;
  createSavedTemplate: (name: string, description?: string) => Promise<SavedNode | null>;
  updateSavedTemplate: (
    templateId: string,
    data: { name?: string; description?: string; layout?: ComposedNodeLayout }
  ) => Promise<SavedNode | null>;
  deleteSavedTemplate: (templateId: string) => Promise<void>;
  applySavedTemplate: (template: SavedNode) => void;
}

export const useComposerStore = create<ComposerState>((set, get) => ({
  // Initial state
  isOpen: false,
  mode: "create",
  targetNodeId: undefined,
  targetTemplateId: undefined,
  currentLayout: null,
  selectedRowId: null,
  selectedElementType: null,
  templates: [],
  isLoadingTemplates: false,
  savedTemplates: [],
  savedTemplatesQuota: null,
  isLoadingSavedTemplates: false,
  savedTemplatesError: null,

  // Modal actions
  openComposer: (mode, nodeId, layout) => {
    // Deep clone the layout to avoid mutating the original when editing
    const newLayout = layout
      ? JSON.parse(JSON.stringify(layout))
      : createDefaultLayout(generateId(), "New Node");
    set({
      isOpen: true,
      mode,
      targetNodeId: nodeId,
      currentLayout: newLayout,
      selectedRowId: null,
      selectedElementType: null,
    });
  },

  closeComposer: () => {
    set({
      isOpen: false,
      mode: "create",
      targetNodeId: undefined,
      targetTemplateId: undefined,
      currentLayout: null,
      selectedRowId: null,
      selectedElementType: null,
    });
  },

  // Open composer for template create/edit (used from My Templates page)
  openTemplateEditor: async (templateId) => {
    if (templateId) {
      // Find template to edit
      const { savedTemplates } = get();
      const template = savedTemplates.find((t) => t.id === templateId);
      if (template && template.layout) {
        const layout = JSON.parse(JSON.stringify(template.layout)) as ComposedNodeLayout;
        set({
          isOpen: true,
          mode: "template",
          targetTemplateId: templateId,
          currentLayout: layout,
          selectedRowId: null,
          selectedElementType: null,
        });
      }
    } else {
      // Create new template
      set({
        isOpen: true,
        mode: "template",
        targetTemplateId: undefined,
        currentLayout: createDefaultLayout(generateId(), "New Template"),
        selectedRowId: null,
        selectedElementType: null,
      });
    }
  },

  // Layout actions
  setLayout: (layout) => {
    set({ currentLayout: layout });
  },

  resetLayout: () => {
    set({
      currentLayout: createDefaultLayout(generateId(), "New Node"),
      selectedRowId: null,
      selectedElementType: null,
    });
  },

  updateLayoutName: (name) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    set({
      currentLayout: { ...currentLayout, name },
    });
  },

  updateLayoutDescription: (description) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    set({
      currentLayout: { ...currentLayout, description },
    });
  },

  // Header actions
  setHeader: (header) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    set({
      currentLayout: { ...currentLayout, header },
    });
  },

  updateHeader: (updates) => {
    const { currentLayout } = get();
    if (!currentLayout || !currentLayout.header) return;
    set({
      currentLayout: {
        ...currentLayout,
        header: { ...currentLayout.header, ...updates },
      },
    });
  },

  // Footer actions
  setFooter: (footer) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    set({
      currentLayout: { ...currentLayout, footer },
    });
  },

  updateFooter: (updates) => {
    const { currentLayout } = get();
    if (!currentLayout || !currentLayout.footer) return;
    set({
      currentLayout: {
        ...currentLayout,
        footer: { ...currentLayout.footer, ...updates },
      },
    });
  },

  // Style actions
  updateStyle: (updates) => {
    const { currentLayout } = get();
    if (!currentLayout) return;
    set({
      currentLayout: {
        ...currentLayout,
        style: { ...currentLayout.style, ...updates },
      },
    });
  },

  // Row actions
  addRow: (index) => {
    const { currentLayout } = get();
    if (!currentLayout) return "";

    const newRow = createDefaultRow(generateId());
    const rows = [...currentLayout.rows];

    if (index !== undefined && index >= 0 && index <= rows.length) {
      rows.splice(index, 0, newRow);
    } else {
      rows.push(newRow);
    }

    set({
      currentLayout: { ...currentLayout, rows },
      selectedRowId: newRow.id,
      selectedElementType: "row",
    });

    return newRow.id;
  },

  updateRow: (rowId, updates) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    const rows = currentLayout.rows.map((row) => (row.id === rowId ? { ...row, ...updates } : row));

    set({
      currentLayout: { ...currentLayout, rows },
    });
  },

  removeRow: (rowId) => {
    const { currentLayout, selectedRowId } = get();
    if (!currentLayout) return;

    const rows = currentLayout.rows.filter((row) => row.id !== rowId);

    set({
      currentLayout: { ...currentLayout, rows },
      selectedRowId: selectedRowId === rowId ? null : selectedRowId,
      selectedElementType: selectedRowId === rowId ? null : get().selectedElementType,
    });
  },

  reorderRows: (startIndex, endIndex) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    const rows = [...currentLayout.rows];
    const [removed] = rows.splice(startIndex, 1);
    rows.splice(endIndex, 0, removed);

    set({
      currentLayout: { ...currentLayout, rows },
    });
  },

  duplicateRow: (rowId) => {
    const { currentLayout } = get();
    if (!currentLayout) return null;

    const rowIndex = currentLayout.rows.findIndex((row) => row.id === rowId);
    if (rowIndex === -1) return null;

    const originalRow = currentLayout.rows[rowIndex];
    const newRow: ComposedRow = {
      ...JSON.parse(JSON.stringify(originalRow)), // Deep clone
      id: generateId(),
      leftHandle: originalRow.leftHandle
        ? { ...originalRow.leftHandle, id: generateId() }
        : undefined,
      rightHandle: originalRow.rightHandle
        ? { ...originalRow.rightHandle, id: generateId() }
        : undefined,
      content: originalRow.content ? { ...originalRow.content, id: generateId() } : undefined,
    };

    const rows = [...currentLayout.rows];
    rows.splice(rowIndex + 1, 0, newRow);

    set({
      currentLayout: { ...currentLayout, rows },
      selectedRowId: newRow.id,
      selectedElementType: "row",
    });

    return newRow.id;
  },

  // Handle actions
  setRowHandle: (rowId, position, handle) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    const rows = currentLayout.rows.map((row) => {
      if (row.id !== rowId) return row;
      if (position === "left") {
        return { ...row, leftHandle: handle };
      } else {
        return { ...row, rightHandle: handle };
      }
    });

    set({
      currentLayout: { ...currentLayout, rows },
    });
  },

  updateRowHandle: (rowId, position, updates) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    const rows = currentLayout.rows.map((row) => {
      if (row.id !== rowId) return row;
      const handle = position === "left" ? row.leftHandle : row.rightHandle;
      if (!handle) return row;

      const updatedHandle = { ...handle, ...updates };
      if (position === "left") {
        return { ...row, leftHandle: updatedHandle };
      } else {
        return { ...row, rightHandle: updatedHandle };
      }
    });

    set({
      currentLayout: { ...currentLayout, rows },
    });
  },

  // Content actions
  setRowContent: (rowId, content) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    const rows = currentLayout.rows.map((row) => (row.id === rowId ? { ...row, content } : row));

    set({
      currentLayout: { ...currentLayout, rows },
    });
  },

  updateRowContent: (rowId, updates) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    const rows = currentLayout.rows.map((row) => {
      if (row.id !== rowId || !row.content) return row;
      // Merge updates into the existing content block
      const updatedContent = Object.assign({}, row.content, updates);
      return {
        ...row,
        content: updatedContent as ContentBlock,
      };
    });

    set({
      currentLayout: { ...currentLayout, rows },
    });
  },

  // Selection actions
  selectRow: (rowId) => {
    set({
      selectedRowId: rowId,
      selectedElementType: rowId ? "row" : null,
    });
  },

  selectElement: (rowId, elementType) => {
    set({
      selectedRowId: rowId,
      selectedElementType: elementType,
    });
  },

  clearSelection: () => {
    set({
      selectedRowId: null,
      selectedElementType: null,
    });
  },

  // Template actions (placeholders for future implementation)
  loadTemplates: async () => {
    set({ isLoadingTemplates: true });
    // TODO: Implement API call
    // const templates = await composerApi.listTemplates();
    set({ templates: [], isLoadingTemplates: false });
  },

  saveAsTemplate: async (name, description) => {
    const { currentLayout } = get();
    if (!currentLayout) return null;

    const template: NodeTemplate = {
      ...currentLayout,
      id: generateId(),
      name,
      description,
      isTemplate: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Implement API call
    // await composerApi.createTemplate(template);

    set((state) => ({
      templates: [...state.templates, template],
    }));

    return template;
  },

  deleteTemplate: async (templateId) => {
    // TODO: Implement API call
    // await composerApi.deleteTemplate(templateId);

    set((state) => ({
      templates: state.templates.filter((t) => t.id !== templateId),
    }));
  },

  applyTemplate: (template) => {
    const newLayout: ComposedNodeLayout = {
      ...JSON.parse(JSON.stringify(template)), // Deep clone
      id: generateId(),
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Regenerate all IDs
    newLayout.rows = newLayout.rows.map((row) => ({
      ...row,
      id: generateId(),
      leftHandle: row.leftHandle ? { ...row.leftHandle, id: generateId() } : undefined,
      rightHandle: row.rightHandle ? { ...row.rightHandle, id: generateId() } : undefined,
      content: row.content ? { ...row.content, id: generateId() } : undefined,
    }));

    set({
      currentLayout: newLayout,
      selectedRowId: null,
      selectedElementType: null,
    });
  },

  // Saved template actions (backend-stored user templates)
  loadSavedTemplates: async () => {
    set({ isLoadingSavedTemplates: true, savedTemplatesError: null });
    try {
      const response = await listSavedNodes({ limit: 100 });
      set({
        savedTemplates: response.items,
        savedTemplatesQuota: response.quota,
        isLoadingSavedTemplates: false,
      });
    } catch (err) {
      set({
        savedTemplatesError: err instanceof Error ? err.message : "Failed to load templates",
        isLoadingSavedTemplates: false,
      });
    }
  },

  createSavedTemplate: async (name, description) => {
    const { currentLayout } = get();
    if (!currentLayout) return null;

    try {
      const saved = await createSavedNode({
        name,
        description,
        layout: currentLayout,
      });

      // Refresh the list to get updated quota
      await get().loadSavedTemplates();

      return saved;
    } catch (err) {
      set({
        savedTemplatesError: err instanceof Error ? err.message : "Failed to create template",
      });
      return null;
    }
  },

  updateSavedTemplate: async (templateId, data) => {
    try {
      const updated = await updateSavedNode(templateId, data);

      // Update local state
      set((state) => ({
        savedTemplates: state.savedTemplates.map((t) => (t.id === templateId ? updated : t)),
      }));

      return updated;
    } catch (err) {
      set({
        savedTemplatesError: err instanceof Error ? err.message : "Failed to update template",
      });
      return null;
    }
  },

  deleteSavedTemplate: async (templateId) => {
    try {
      await deleteSavedNode(templateId);

      // Update local state
      set((state) => ({
        savedTemplates: state.savedTemplates.filter((t) => t.id !== templateId),
        savedTemplatesQuota: state.savedTemplatesQuota
          ? { ...state.savedTemplatesQuota, used: state.savedTemplatesQuota.used - 1 }
          : null,
      }));
    } catch (err) {
      set({
        savedTemplatesError: err instanceof Error ? err.message : "Failed to delete template",
      });
    }
  },

  applySavedTemplate: (template) => {
    if (!template.layout) return;

    const newLayout: ComposedNodeLayout = {
      ...JSON.parse(JSON.stringify(template.layout)), // Deep clone
      id: generateId(),
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Regenerate all IDs
    newLayout.rows = newLayout.rows.map((row) => ({
      ...row,
      id: generateId(),
      leftHandle: row.leftHandle ? { ...row.leftHandle, id: generateId() } : undefined,
      rightHandle: row.rightHandle ? { ...row.rightHandle, id: generateId() } : undefined,
      content: row.content ? { ...row.content, id: generateId() } : undefined,
    }));

    set({
      currentLayout: newLayout,
      selectedRowId: null,
      selectedElementType: null,
    });
  },
}));
