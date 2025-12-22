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
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">Editor Settings</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label
              htmlFor="helper-lines"
              className="text-sm font-medium text-slate-700"
            >
              Helper Lines
            </label>
            <p className="text-xs text-slate-500">
              Alignment guides when dragging
            </p>
          </div>
          <Switch
            id="helper-lines"
            checked={helperLinesEnabled}
            onCheckedChange={setHelperLinesEnabled}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <label
              htmlFor="connection-suggestions"
              className="text-sm font-medium text-slate-700"
            >
              Connection Suggestions
            </label>
            <p className="text-xs text-slate-500">
              Suggest links when nodes are near
            </p>
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
