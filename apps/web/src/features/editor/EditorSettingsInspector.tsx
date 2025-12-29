/**
 * @file EditorSettingsInspector.tsx
 * @description Inspector for editor settings including helper lines, connection suggestions, grid snapping, and grid visibility
 */
import { Grid3X3 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useEditorSettingsStore } from "../../store/editorSettingsStore";
import { useGraphStore, type GridSize } from "../../store/graphStore";

export default function EditorSettingsInspector() {
  const {
    helperLinesEnabled,
    connectionSuggestionsEnabled,
    setHelperLinesEnabled,
    setConnectionSuggestionsEnabled,
  } = useEditorSettingsStore();

  const { gridSettings, setGridSettings, snapAllNodesToGrid } = useGraphStore();

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-3 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Editor Settings</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label htmlFor="helper-lines" className="text-sm font-medium text-foreground">
              Helper Lines
            </label>
            <p className="text-xs text-muted-foreground">Alignment guides when dragging</p>
          </div>
          <Switch
            id="helper-lines"
            checked={helperLinesEnabled}
            onCheckedChange={setHelperLinesEnabled}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label htmlFor="connection-suggestions" className="text-sm font-medium text-foreground">
              Connection Suggestions
            </label>
            <p className="text-xs text-muted-foreground">Suggest links when nodes are near</p>
          </div>
          <Switch
            id="connection-suggestions"
            checked={connectionSuggestionsEnabled}
            onCheckedChange={setConnectionSuggestionsEnabled}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label htmlFor="snap-to-grid" className="text-sm font-medium text-foreground">
              Snap to Grid
            </label>
            <p className="text-xs text-muted-foreground">Snap nodes to grid when dragging</p>
          </div>
          <Switch
            id="snap-to-grid"
            checked={gridSettings.snapEnabled}
            onCheckedChange={(checked) => setGridSettings({ snapEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label htmlFor="show-grid" className="text-sm font-medium text-foreground">
              Show Grid
            </label>
            <p className="text-xs text-muted-foreground">Display grid lines on canvas</p>
          </div>
          <Switch
            id="show-grid"
            checked={gridSettings.gridVisible}
            onCheckedChange={(checked) => setGridSettings({ gridVisible: checked })}
          />
        </div>

        {(gridSettings.gridVisible || gridSettings.snapEnabled) && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <label htmlFor="grid-size" className="text-sm font-medium text-foreground">
                  Grid Size
                </label>
                <p className="text-xs text-muted-foreground">Size of grid cells</p>
              </div>
              <Select
                value={String(gridSettings.gridSize)}
                onValueChange={(value) => setGridSettings({ gridSize: Number(value) as GridSize })}
              >
                <SelectTrigger className="w-36" id="grid-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">Small (12px)</SelectItem>
                  <SelectItem value="24">Medium (24px)</SelectItem>
                  <SelectItem value="36">Large (36px)</SelectItem>
                  <SelectItem value="48">X-Large (48px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={snapAllNodesToGrid}>
              <Grid3X3 className="mr-2 h-4 w-4" />
              Snap All to Grid
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
