/**
 * @file MeSavedNodesRoute.tsx
 * @description Saved Nodes page within the /me hub. Shows user's saved composed node
 * layouts that can be reused across graphs. Uses the Node Composer for create/edit.
 */

import { useCallback, useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Puzzle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { useComposerStore } from "../features/composer/composerStore";
import { NodeComposerModal } from "../features/composer/components/NodeComposerModal";
import type { SavedNode } from "../features/composer/composerApi";

export default function MeSavedNodesRoute() {
  const {
    savedTemplates,
    savedTemplatesQuota,
    isLoadingSavedTemplates,
    savedTemplatesError,
    loadSavedTemplates,
    openTemplateEditor,
    createSavedTemplate,
    updateSavedTemplate,
    deleteSavedTemplate,
    currentLayout,
    mode,
    targetTemplateId,
    closeComposer,
  } = useComposerStore();

  const [deleteTarget, setDeleteTarget] = useState<SavedNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load templates on mount
  useEffect(() => {
    void loadSavedTemplates();
  }, [loadSavedTemplates]);

  // Handle save from composer modal
  const handleComposerApply = useCallback(async () => {
    if (!currentLayout) return;

    if (mode === "template") {
      if (targetTemplateId) {
        // Update existing template
        await updateSavedTemplate(targetTemplateId, {
          name: currentLayout.name,
          description: currentLayout.description,
          layout: currentLayout,
        });
      } else {
        // Create new template
        await createSavedTemplate(currentLayout.name, currentLayout.description);
      }
    }

    closeComposer();
  }, [
    currentLayout,
    mode,
    targetTemplateId,
    updateSavedTemplate,
    createSavedTemplate,
    closeComposer,
  ]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteSavedTemplate(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const canCreateMore = savedTemplatesQuota
    ? savedTemplatesQuota.used < savedTemplatesQuota.max
    : true;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Saved Nodes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your saved composed nodes for reuse across graphs
          </p>
        </div>
        <Button onClick={() => openTemplateEditor()} disabled={!canCreateMore}>
          <Plus className="mr-2 h-4 w-4" />
          New Node
        </Button>
      </div>

      {/* Quota display */}
      {savedTemplatesQuota && (
        <div className="text-sm text-muted-foreground">
          {savedTemplatesQuota.used}/{savedTemplatesQuota.max} saved nodes
          {savedTemplatesQuota.plan === "plus" && (
            <span className="ml-2 text-xs text-amber-600">(PLUS)</span>
          )}
        </div>
      )}

      {/* Error display */}
      {savedTemplatesError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {savedTemplatesError}
        </div>
      )}

      {/* Loading state */}
      {isLoadingSavedTemplates ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : savedTemplates.length === 0 ? (
        /* Empty state */
        <section className="rounded-lg border border-dashed border-border bg-secondary/50 p-8 text-center">
          <Puzzle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 font-medium text-foreground">No saved nodes yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first saved node to reuse across your graphs.
          </p>
          <Button className="mt-4" onClick={() => openTemplateEditor()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Saved Node
          </Button>
        </section>
      ) : (
        /* Templates grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedTemplates.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-lg border border-border bg-card p-4 transition hover:border-muted-foreground/30 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                    <Puzzle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-foreground">{template.name}</h3>
                    {template.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openTemplateEditor(template.id)}
                >
                  <Edit2 className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteTarget(template)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Metadata */}
              <div className="mt-3 text-xs text-muted-foreground">
                {template.updatedAt
                  ? `Updated ${new Date(template.updatedAt).toLocaleDateString()}`
                  : template.createdAt
                    ? `Created ${new Date(template.createdAt).toLocaleDateString()}`
                    : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Node Composer Modal (reused) */}
      <NodeComposerModal onApply={handleComposerApply} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Node</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
