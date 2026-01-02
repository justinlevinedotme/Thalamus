import { useCallback, useState } from "react";
import { AlertCircle, FileJson, Upload } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

type GraphImport = {
  title?: string;
  nodes: unknown[];
  edges: unknown[];
  version?: number;
};

type ImportGraphDialogProps = {
  open: boolean;
  onClose: () => void;
  onImport: (data: { title: string; nodes: unknown[]; edges: unknown[] }) => void;
};

function parseJson(text: string): GraphImport | null {
  try {
    const data = JSON.parse(text) as GraphImport;
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export default function ImportGraphDialog({ open, onClose, onImport }: ImportGraphDialogProps) {
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImportData = useCallback(
    (data: GraphImport) => {
      onImport({
        title: data.title || "Imported Graph",
        nodes: data.nodes,
        edges: data.edges,
      });
      setPasteValue("");
      setError(null);
      onClose();
    },
    [onImport, onClose]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const text = await file.text();
        const data = parseJson(text);
        if (!data) {
          setError("Invalid JSON format. Make sure it contains 'nodes' and 'edges' arrays.");
          return;
        }
        handleImportData(data);
      } catch {
        setError("Failed to read file.");
      }
    },
    [handleImportData]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        void handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handlePasteImport = useCallback(() => {
    setError(null);
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      setError("Please paste JSON content.");
      return;
    }
    const data = parseJson(trimmed);
    if (!data) {
      setError("Invalid JSON format. Make sure it contains 'nodes' and 'edges' arrays.");
      return;
    }
    handleImportData(data);
  }, [pasteValue, handleImportData]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setPasteValue("");
        setError(null);
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Import Graph
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">Drop a JSON file here</p>
              <p className="mb-4 text-xs text-muted-foreground">or click to browse</p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileInputChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <Button variant="outline" size="sm" className="pointer-events-none">
                Browse Files
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="paste" className="mt-4 space-y-4">
            <Textarea
              placeholder='Paste your JSON here...

{
  "title": "My Graph",
  "nodes": [...],
  "edges": [...],
  "version": 2
}'
              value={pasteValue}
              onChange={(e) => {
                setPasteValue(e.target.value);
                setError(null);
              }}
              className="min-h-[200px] font-mono text-xs"
            />
            <Button onClick={handlePasteImport} className="w-full">
              Import
            </Button>
          </TabsContent>
        </Tabs>

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
