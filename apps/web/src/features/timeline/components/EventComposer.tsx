import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { TimelineNode, TimelineTrack } from "../types";

interface EventComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    label: string;
    description?: string;
    isSpan: boolean;
    duration?: number;
  }) => void;
  editingNode?: TimelineNode;
  tracks: TimelineTrack[];
  selectedTrackId: string | null;
}

export function EventComposer({
  open,
  onOpenChange,
  onSave,
  editingNode,
  tracks,
  selectedTrackId,
}: EventComposerProps) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isSpan, setIsSpan] = useState(false);
  const [duration, setDuration] = useState(10);

  // Reset form when opening/closing or when editing node changes
  useEffect(() => {
    if (open) {
      if (editingNode) {
        setLabel(editingNode.data.label);
        setDescription(editingNode.data.description ?? "");
        setIsSpan(editingNode.data.type === "span");
        if (editingNode.data.type === "span") {
          const dur = (editingNode.data.endPosition - editingNode.data.startPosition) * 100;
          setDuration(Math.round(dur));
        }
      } else {
        setLabel("");
        setDescription("");
        setIsSpan(false);
        setDuration(10);
      }
    }
  }, [open, editingNode]);

  const handleSave = () => {
    if (!label.trim()) return;

    onSave({
      label: label.trim(),
      description: description.trim() || undefined,
      isSpan,
      duration: isSpan ? duration : undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingNode ? "Edit Event" : "New Event"}</DialogTitle>
          <DialogDescription>
            {selectedTrack && (
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedTrack.color ?? "#64748b" }}
                />
                {selectedTrack.label}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Label */}
          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Event name..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </div>

          {/* Span toggle - only for new events */}
          {!editingNode && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="span-toggle">Duration span</Label>
                <p className="text-xs text-muted-foreground">Create a bar that spans a range</p>
              </div>
              <Switch id="span-toggle" checked={isSpan} onCheckedChange={setIsSpan} />
            </div>
          )}

          {/* Duration - only for spans */}
          {isSpan && !editingNode && (
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={100}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">of axis length</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!label.trim()}>
            {editingNode ? "Save Changes" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
