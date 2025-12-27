import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EditorSettings = {
  helperLinesEnabled: boolean;
  connectionSuggestionsEnabled: boolean;
};

type EditorSettingsState = EditorSettings & {
  setHelperLinesEnabled: (enabled: boolean) => void;
  setConnectionSuggestionsEnabled: (enabled: boolean) => void;
};

export const useEditorSettingsStore = create<EditorSettingsState>()(
  persist(
    (set) => ({
      helperLinesEnabled: true,
      connectionSuggestionsEnabled: true,
      setHelperLinesEnabled: (enabled) => set({ helperLinesEnabled: enabled }),
      setConnectionSuggestionsEnabled: (enabled) => set({ connectionSuggestionsEnabled: enabled }),
    }),
    {
      name: "thalamus-editor-settings",
    }
  )
);
