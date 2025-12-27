import { Switch } from "../../components/ui/switch";
import { useEditorSettingsStore } from "../../store/editorSettingsStore";

export default function EditorSettingsInspector() {
  const {
    helperLinesEnabled,
    connectionSuggestionsEnabled,
    setHelperLinesEnabled,
    setConnectionSuggestionsEnabled,
  } = useEditorSettingsStore();

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
      </div>
    </div>
  );
}
