import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { useComposerStore } from "../composerStore";
import { ComposerLayout } from "./ComposerLayout";

interface NodeComposerModalProps {
  onApply?: (
    layout: ReturnType<typeof useComposerStore.getState>["currentLayout"],
    mode: "create" | "edit" | "template",
    targetNodeId?: string
  ) => void;
}

export function NodeComposerModal({ onApply }: NodeComposerModalProps) {
  const { isOpen, mode, targetNodeId, currentLayout, closeComposer, resetLayout } =
    useComposerStore();

  const handleApply = useCallback(() => {
    if (currentLayout && onApply) {
      onApply(currentLayout, mode, targetNodeId);
    }
    closeComposer();
  }, [currentLayout, mode, targetNodeId, onApply, closeComposer]);

  const handleCancel = useCallback(() => {
    closeComposer();
  }, [closeComposer]);

  const handleReset = useCallback(() => {
    resetLayout();
  }, [resetLayout]);

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create Composed Node";
      case "edit":
        return "Edit Node Layout";
      case "template":
        return "Manage Templates";
      default:
        return "Node Composer";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Drag components to build your custom node layout";
      case "edit":
        return "Modify the layout of this node";
      case "template":
        return "Browse and manage your node templates";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeComposer()}>
      <DialogContent className="max-w-[90vw] w-[1400px] h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ComposerLayout />
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={!currentLayout}>
                {mode === "edit" ? "Save Changes" : "Create Node"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
