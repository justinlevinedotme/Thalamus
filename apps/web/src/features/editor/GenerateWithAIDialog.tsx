import { useCallback, useState } from "react";
import { AlertCircle, Check, Copy, ExternalLink, Sparkles } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";

type GenerateWithAIDialogProps = {
  open: boolean;
  onClose: () => void;
  onImport?: (data: { title: string; nodes: unknown[]; edges: unknown[] }) => void;
};

const LLM_INSTRUCTIONS_URL = "/llm-instructions.md";

const EXAMPLE_PROMPT = `Create a diagram showing a user authentication flow:
- Login form (user enters credentials)
- Auth API (validates and checks database)  
- Database (stores user records)
- Success response (returns JWT token)
- Error response (invalid credentials)

Connect them left-to-right showing the request flow and both success/error paths.`;

export default function GenerateWithAIDialog({
  open,
  onClose,
  onImport,
}: GenerateWithAIDialogProps) {
  const [copiedInstructions, setCopiedInstructions] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${LLM_INSTRUCTIONS_URL}`
      : LLM_INSTRUCTIONS_URL;

  const prefilledPrompt = `Read the Thalamus diagram format instructions at ${fullUrl} and help me create a diagram. I'll describe what I want, and you generate the JSON that I can import into Thalamus.`;

  const chatGptUrl = `https://chatgpt.com/?prompt=${encodeURIComponent(prefilledPrompt)}`;
  const claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(prefilledPrompt)}`;
  const geminiUrl = `https://gemini.google.com/app?hl=en`;

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyInstructions = async () => {
    try {
      const response = await fetch(LLM_INSTRUCTIONS_URL);
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopiedInstructions(true);
      setTimeout(() => setCopiedInstructions(false), 2000);
    } catch {
      console.error("Failed to copy instructions");
    }
  };

  const handleImport = useCallback(() => {
    setError(null);
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      setError("Please paste JSON content.");
      return;
    }
    try {
      const data = JSON.parse(trimmed);
      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
        setError("Invalid format: must have 'nodes' and 'edges' arrays.");
        return;
      }
      onImport?.({
        title: data.title || "Imported Graph",
        nodes: data.nodes,
        edges: data.edges,
      });
      setPasteValue("");
      setError(null);
      onClose();
    } catch {
      setError("Invalid JSON. Check for syntax errors.");
    }
  }, [pasteValue, onImport, onClose]);

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate with AI
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Use any LLM (ChatGPT, Claude, Gemini, etc.) to generate diagrams. Paste the JSON output
          below to import.
        </p>

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="import">Import JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">1. Open your LLM with instructions pre-loaded</h3>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={chatGptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
                  </svg>
                  Open in ChatGPT
                </a>
                <a
                  href={claudeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#D97757">
                    <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
                  </svg>
                  Open in Claude
                </a>
                <a
                  href={geminiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 24C12 24 12 12 24 12C12 12 12 0 12 0C12 0 12 12 0 12C12 12 12 24 12 24Z"
                      fill="url(#gemini-gradient)"
                    />
                    <defs>
                      <linearGradient
                        id="gemini-gradient"
                        x1="0"
                        y1="12"
                        x2="24"
                        y2="12"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#4285F4" />
                        <stop offset="1" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Open in Gemini
                </a>
              </div>
              <button
                type="button"
                onClick={copyInstructions}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
              >
                {copiedInstructions ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Or copy instructions to clipboard
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">2. Describe your diagram</h3>
              <p className="text-xs text-muted-foreground">Example prompt:</p>
              <div className="relative">
                <pre className="rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap">
                  {EXAMPLE_PROMPT}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(EXAMPLE_PROMPT, setCopiedPrompt)}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded border border-border bg-background hover:bg-secondary transition"
                >
                  {copiedPrompt ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">3. Import the result</h3>
              <p className="text-xs text-muted-foreground">
                Copy the JSON from your LLM and paste it in the Import tab.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <Textarea
              placeholder='Paste JSON from your LLM here...

{
  "title": "My Diagram",
  "nodes": [...],
  "edges": [...],
  "version": 2
}'
              value={pasteValue}
              onChange={(e) => {
                setPasteValue(e.target.value);
                setError(null);
              }}
              className="min-h-[240px] font-mono text-xs"
            />

            {error ? (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            ) : null}

            <Button onClick={handleImport} className="w-full" disabled={!onImport}>
              Import Diagram
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
